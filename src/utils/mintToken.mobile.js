import { Buffer } from "buffer";
import { WebUploader } from "@irys/web-upload";
import { WebSolana } from "@irys/web-upload-solana";

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import { getAuth } from "../../authStorage";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

function toBaseUnitsBigInt(supplyStr, decimalsNum) {
  const clean = String(supplyStr || "").trim();
  if (!/^\d+$/.test(clean)) return null;
  const supply = BigInt(clean);
  const factor = 10n ** BigInt(decimalsNum);
  return supply * factor;
}

async function uploadToIrys({ name, symbol, description, imageFile, wallet, rpcUrl }) {
  if (!wallet) throw new Error("Wallet not connected");
  if (!rpcUrl) throw new Error("Missing RPC URL");

  const irys = await WebUploader(WebSolana).withProvider(wallet).withRpc(rpcUrl).mainnet();

  const price = await irys.getPrice(imageFile.size);
  const balance = await irys.getBalance();

  const priceBI = BigInt(price.toString());
  const balBI = BigInt(balance.toString());

  if (balBI < priceBI) {
    const bufferBI = (priceBI * 12n) / 10n; // +20%
    await irys.fund(bufferBI);
  }

  const mime = imageFile?.type || "image/png";
  const imgReceipt = await irys.uploadFile(imageFile, {
    tags: [{ name: "Content-Type", value: mime }],
  });

  const imageUrl = `https://gateway.irys.xyz/${imgReceipt.id}`;

  const metadata = {
    name,
    symbol,
    description: description || "Created on OriginFi.",
    image: imageUrl,
    properties: {
      files: [{ uri: imageUrl, type: mime }],
      category: "image",
    },
  };

  const metaReceipt = await irys.upload(JSON.stringify(metadata), {
    tags: [{ name: "Content-Type", value: "application/json" }],
  });

  const metadataUrl = `https://gateway.irys.xyz/${metaReceipt.id}`;

  return { imageUrl, metadataUrl };
}

/**
 * Shared mint flow (copied 1:1 from your desktop TokenCreationForm.jsx logic).
 *
 * @param {object} args
 * @param {object} args.wallet  - wallet adapter object from useWallet()
 * @param {object} args.formData - { name, symbol, decimals, supply, description, imageFile, makeMetadataImmutable }
 * @param {(msg: string) => void} [args.onStatus] - status callback (optional)
 *
 * @returns {Promise<{ ok: true, sig: string, mint: string, ata: string, metadataUrl: string, savedToDb: boolean }>}
 */
export async function mintTokenShared({ wallet, formData, onStatus }) {
  const setStatus = (m) => onStatus && onStatus(String(m || ""));

  const { publicKey, sendTransaction } = wallet || {};

  if (!publicKey) throw new Error("Please connect your wallet first.");
  if (!sendTransaction) throw new Error("Wallet does not support sending transactions.");

  const auth = getAuth();
  const token = auth?.token;

  const isGuest = !token && localStorage.getItem("originfi_session_mode") === "guest";
  if (!token && !isGuest) throw new Error("Please sign in or continue as guest to create a token.");

  if (!formData?.supply || Number(formData.supply) <= 0) throw new Error("Please enter a valid total supply.");

  const decimals = Number(formData.decimals);
  if (Number.isNaN(decimals) || decimals < 0 || decimals > 18) {
    throw new Error("Decimals must be between 0 and 18.");
  }

  const baseUnits = toBaseUnitsBigInt(formData.supply, decimals);
  if (baseUnits == null) throw new Error("Supply must be a whole number.");

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const treasuryStr = import.meta.env.VITE_ORIGINFI_TREASURY;
  if (!treasuryStr) throw new Error("OriginFi treasury wallet is not configured (VITE_ORIGINFI_TREASURY).");
  const treasuryPubkey = new PublicKey(treasuryStr);

  const feeSol = Number(import.meta.env.VITE_ORIGINFI_MINT_FEE_SOL || "0.05");
  const feeLamports = Math.round(feeSol * LAMPORTS_PER_SOL);
  if (!Number.isFinite(feeLamports) || feeLamports <= 0) {
    throw new Error("OriginFi mint fee is not configured correctly.");
  }

  const network = "mainnet-beta";
  const rpc = import.meta.env.VITE_SOLANA_RPC;
  if (!rpc) throw new Error("Missing VITE_SOLANA_RPC.");
  const connection = new Connection(rpc, "confirmed");

  // image required (same as desktop)
  if (!formData?.imageFile) throw new Error("Please upload a logo image first.");

  setStatus("Building transaction...");

  const mintKeypair = Keypair.generate();
  const mintPubkey = mintKeypair.publicKey;

  const ata = await getAssociatedTokenAddress(mintPubkey, publicKey);

  const lamportsForMint = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  const tx = new Transaction();

  tx.add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: treasuryPubkey,
      lamports: feeLamports,
    })
  );

  tx.add(
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mintPubkey,
      space: MINT_SIZE,
      lamports: lamportsForMint,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  tx.add(
    createInitializeMintInstruction(
      mintPubkey,
      decimals,
      publicKey,
      publicKey,
      TOKEN_PROGRAM_ID
    )
  );

  tx.add(
    createAssociatedTokenAccountInstruction(
      publicKey,
      ata,
      publicKey,
      mintPubkey
    )
  );

  tx.add(createMintToInstruction(mintPubkey, ata, publicKey, baseUnits));

  setStatus("Uploading metadata...");

  const { metadataUrl } = await uploadToIrys({
    name: formData.name,
    symbol: formData.symbol,
    description: formData.description,
    imageFile: formData.imageFile,
    wallet,
    rpcUrl: import.meta.env.VITE_SOLANA_RPC,
  });

  const [metadataPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  );

  tx.add(
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPda,
        mint: mintPubkey,
        mintAuthority: publicKey,
        payer: publicKey,
        updateAuthority: publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: formData.name,
            symbol: formData.symbol,
            uri: metadataUrl,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          isMutable: !formData.makeMetadataImmutable,
          collectionDetails: null,
        },
      }
    )
  );

  tx.feePayer = publicKey;
  const latest = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = latest.blockhash;

  tx.partialSign(mintKeypair);

  setStatus("Please approve the transaction in your wallet...");

  const sig = await sendTransaction(tx, connection);

  setStatus("Confirming transaction on Solana...");

  const conf = await connection.confirmTransaction(
    {
      signature: sig,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    },
    "confirmed"
  );

  if (conf?.value?.err) {
    throw new Error("Transaction failed. See console for details.");
  }

  // Save to backend only if authed token exists (same as desktop)
  let savedToDb = false;

  if (token) {
    setStatus("Saving token to OriginFi...");

    const body = {
      network,
      txSignature: sig,
      mintAddress: mintPubkey.toBase58(),
      ataAddress: ata.toBase58(),
      ownerWallet: publicKey.toBase58(),
      feeLamports,

      name: formData.name,
      symbol: formData.symbol,
      decimals,
      initialSupply: String(formData.supply),

      description: formData.description,
      imageURI: metadataUrl,
      metadataMutable: !formData.makeMetadataImmutable,
    };

    const res = await fetch(`${apiBase}/api/token/confirm-mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || data.ok === false) {
      const message = data?.error || data?.details || "Failed to save token.";
      // Mint succeeded but save failed (same behavior)
      throw new Error(`Mint succeeded, but saving failed: ${message}`);
    }

    savedToDb = true;

    setStatus(
      [
        "Token minted and saved to OriginFi.",
        `Mint: ${mintPubkey.toBase58()}`,
        `ATA: ${ata.toBase58()}`,
        `Tx: ${sig}`,
      ].join("\n")
    );
  } else {
    setStatus(
      [
        "Token minted successfully (Guest Mode).",
        "Create an account to claim and manage this token in OriginFi.",
        `Mint: ${mintPubkey.toBase58()}`,
        `ATA: ${ata.toBase58()}`,
        `Tx: ${sig}`,
      ].join("\n")
    );
  }

  return {
    ok: true,
    sig,
    mint: mintPubkey.toBase58(),
    ata: ata.toBase58(),
    metadataUrl,
    savedToDb,
  };
}
