import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { FaInfoCircle, FaMoneyBillWave, FaUsers } from "react-icons/fa";
import { getAuth } from "../authStorage";
import {
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);


export default function TokenCreationForm() {
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    decimals: 9,
    supply: "",
    description: "",
    imageURI: "",
    sellerFeeBasisPoints: 0,
    creators: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imageFile") {
      if (files && files[0]) {
        const url = URL.createObjectURL(files[0]);
        setFormData((prev) => ({ ...prev, imageURI: url }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toBaseUnitsBigInt = (supplyStr, decimalsNum) => {
    // supplyStr is whole-token units (no decimals input in UI right now)
    // Convert to base units using BigInt to avoid floating errors.
    const clean = String(supplyStr || "").trim();
    if (!/^\d+$/.test(clean)) return null;

    const supply = BigInt(clean);
    const factor = 10n ** BigInt(decimalsNum);
    return supply * factor;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      if (!publicKey) {
        alert("Please connect your wallet first.");
        return;
      }
      if (!sendTransaction) {
        alert("Wallet does not support sending transactions.");
        return;
      }

      const auth = getAuth();
      const token = auth?.token;

      if (!token) {
        alert("You must be logged in to create a token.");
        return;
      }

      if (!formData.supply || Number(formData.supply) <= 0) {
        alert("Please enter a valid total supply.");
        return;
      }

      const decimals = Number(formData.decimals);
      if (Number.isNaN(decimals) || decimals < 0 || decimals > 18) {
        alert("Decimals must be between 0 and 18.");
        return;
      }

      const baseUnits = toBaseUnitsBigInt(formData.supply, decimals);
      if (baseUnits == null) {
        alert("Supply must be a whole number.");
        return;
      }

      // ---- Config (env) ----
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

      const treasuryStr = import.meta.env.VITE_ORIGINFI_TREASURY;
      if (!treasuryStr) {
        alert("OriginFi treasury wallet is not configured (VITE_ORIGINFI_TREASURY).");
        return;
      }
      const treasuryPubkey = new PublicKey(treasuryStr);

      const feeSol = Number(import.meta.env.VITE_ORIGINFI_MINT_FEE_SOL || "0.05");
      const feeLamports = Math.round(feeSol * LAMPORTS_PER_SOL);
      if (!Number.isFinite(feeLamports) || feeLamports <= 0) {
        alert("OriginFi mint fee is not configured correctly.");
        return;
      }

      // For now keep devnet; when you flip to mainnet, change to "mainnet-beta"
      const network = "devnet";
      const connection = new Connection(clusterApiUrl(network), "confirmed");

      setLoading(true);
      setStatus("Building transaction...");

      // ---- Build mint transaction (user pays + signs) ----
      const mintKeypair = Keypair.generate();
      const mintPubkey = mintKeypair.publicKey;

      const ata = await getAssociatedTokenAddress(mintPubkey, publicKey);

      const lamportsForMint = await connection.getMinimumBalanceForRentExemption(
        MINT_SIZE
      );

      const tx = new Transaction();

      // 1) Pay OriginFi fee
      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: feeLamports,
        })
      );

      // 2) Create mint account (payer is user)
      tx.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintPubkey,
          space: MINT_SIZE,
          lamports: lamportsForMint,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // 3) Initialize mint (mint authority = user, freeze authority = user)
      tx.add(
        createInitializeMintInstruction(
          mintPubkey,
          decimals,
          publicKey,
          publicKey,
          TOKEN_PROGRAM_ID
        )
      );

      // 4) Create ATA (payer is user)
      tx.add(
        createAssociatedTokenAccountInstruction(
          publicKey, // payer
          ata, // ata
          publicKey, // owner
          mintPubkey // mint
        )
      );

      // 5) Mint to ATA (mint authority is user)
      tx.add(createMintToInstruction(mintPubkey, ata, publicKey, baseUnits));
      // 6) Create Metaplex metadata (so Phantom shows name/symbol/image)
      // NOTE: This URI MUST be publicly reachable (https), not localhost.
      const metadataUrl = `${apiBase}/api/metadata/${mintPubkey.toBase58()}.json`;

      // Derive Metadata PDA
      const [metadataPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintPubkey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      // Create metadata account instruction
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
                name: formData.name, // keep <= 32 chars
                symbol: formData.symbol, // keep <= 10 chars
                uri: metadataUrl, // points to your JSON
                sellerFeeBasisPoints: Number(formData.sellerFeeBasisPoints || 0),
                creators: null,
                collection: null,
                uses: null,
              },
              isMutable: true,
              collectionDetails: null,
            },
          }
        )
      );

      tx.feePayer = publicKey;
      const latest = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = latest.blockhash;

      // Mint account must sign; user signs via wallet
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
        console.error("Transaction failed:", conf.value.err);
        setStatus("Transaction failed. See console for details.");
        return;
      }

      // ---- Save to OriginFi backend (verify + store) ----
      // NOTE: We keep all metadata fields here so later we can wire Metaplex.
      setStatus("Saving token to OriginFi...");

      const body = {
        // On-chain proof fields
        network, // devnet for now; mainnet later
        txSignature: sig,
        mintAddress: mintPubkey.toBase58(),
        ataAddress: ata.toBase58(),
        ownerWallet: publicKey.toBase58(),
        feeLamports,

        // Token config fields (DB + future metadata)
        name: formData.name,
        symbol: formData.symbol,
        decimals,
        initialSupply: String(formData.supply),

        // metadata fields (we will use later for Metaplex)
        description: formData.description,
        imageURI: formData.imageURI,
        sellerFeeBasisPoints: Number(formData.sellerFeeBasisPoints || 0),
        creators: String(formData.creators || "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
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
        console.error("Confirm mint error:", data);
        const message = data?.error || data?.details || "Failed to save token.";
        setStatus(`Failed to save token: ${message}`);
        alert(`Mint succeeded, but saving failed: ${message}`);
        return;
      }

      setStatus(
        [
          "Token minted and saved to OriginFi.",
          `Mint: ${mintPubkey.toBase58()}`,
          `ATA: ${ata.toBase58()}`,
          `Tx: ${sig}`,
        ].join("\n")
      );

      alert(`Token minted.\nMint: ${mintPubkey.toBase58()}\nTx: ${sig}`);
    } catch (err) {
      console.error("Mint flow error:", err);
      setStatus("Unexpected error while creating token. Check console.");
      alert("Unexpected error while creating token. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const cardsData = [
    {
      title: "Metadata Info",
      text: "Add detailed metadata like description, logo URL, royalties, and creators to your token.",
      icon: <FaInfoCircle className="text-[#1CEAB9] text-4xl mb-4" />,
    },
    {
      title: "Royalties Explained",
      text: "Royalties allow you to earn a percentage on secondary sales of your token. Set as basis points (100 = 1%).",
      icon: <FaMoneyBillWave className="text-[#1CEAB9] text-4xl mb-4" />,
    },
    {
      title: "Creators",
      text: "List the wallet addresses of token creators who will share royalties and help verify authenticity.",
      icon: <FaUsers className="text-[#1CEAB9] text-4xl mb-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex items-start justify-center px-6 py-12 gap-10 bg-transparent">
      {/* Form container */}
      <div className="flex-1 max-w-3xl p-10 rounded-3xl border-[1.5px] border-[#1CEAB9] bg-[#0B0E11] shadow-xl text-white">
        <h2 className="text-3xl font-bold text-center mb-2">Token Creation</h2>
        <p className="text-center text-sm text-gray-400 mb-6">
          This currently sends your token configuration to OriginFi&apos;s backend, which mints
          the SPL token on Solana and saves it to your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* First row: name, symbol, decimals, supply */}
          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">Token Name</label>
              <input
                name="name"
                type="text"
                placeholder="e.g. OriginFi"
                required
                value={formData.name}
                onChange={handleChange}
                className="px-4 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/20 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">Symbol</label>
              <input
                name="symbol"
                type="text"
                placeholder="e.g. ORFI"
                required
                value={formData.symbol}
                onChange={handleChange}
                className="px-4 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/20 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">Decimals</label>
              <input
                name="decimals"
                type="number"
                min="0"
                max="18"
                value={formData.decimals}
                onChange={handleChange}
                className="px-4 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/20 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">Total Supply</label>
              <input
                name="supply"
                type="number"
                placeholder="e.g. 1000000"
                required
                value={formData.supply}
                onChange={handleChange}
                className="px-4 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/20 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
              />
            </div>
          </div>

          {/* Second row: description and image upload side by side */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                placeholder="Describe your token..."
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="px-4 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/20 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
              />
            </div>

            <div className="flex flex-col items-center justify-center">
              <label className="text-sm text-gray-300 mb-1">
                Logo (Click to upload)
              </label>

              <label
                htmlFor="imageFileInput"
                className="cursor-pointer w-full h-36 bg-[#12161C] rounded-lg border border-[#1CEAB9]/20 flex items-center justify-center hover:ring-2 hover:ring-[#1CEAB9] transition relative"
              >
                {formData.imageURI ? (
                  <img
                    src={formData.imageURI}
                    alt="Selected logo"
                    className="max-h-28 object-contain rounded"
                  />
                ) : (
                  <span className="text-[#1CEAB9]">
                    Click here to select logo image
                  </span>
                )}
                <input
                  id="imageFileInput"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Third row: sellerFeeBasisPoints and creators side by side */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">
                Seller Fee Basis Points (Royalties)
              </label>
              <input
                name="sellerFeeBasisPoints"
                type="number"
                min="0"
                max="10000"
                value={formData.sellerFeeBasisPoints}
                onChange={handleChange}
                className="px-4 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/20 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter royalties as basis points (100 = 1%)
              </p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">
                Creators (comma-separated wallet addresses)
              </label>
              <input
                name="creators"
                type="text"
                placeholder="wallet1,wallet2,..."
                value={formData.creators}
                onChange={handleChange}
                className="px-4 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/20 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
              />
              <p className="text-xs text-gray-400 mt-1">
                Optional: list creator addresses for royalties and verification
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#1CEAB9] via-[#17d1a6] to-[#0bc4a1] text-black font-semibold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Token..." : "Mint Token"}
          </button>

          {status && (
            <p className="text-sm text-gray-300 mt-3 text-center whitespace-pre-wrap">
              {status}
            </p>
          )}
        </form>
      </div>

      {/* Glassmorphism cards on the right outside form */}
      <div className="w-80 flex flex-col gap-6">
        {cardsData.map(({ title, text, icon }, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-[#0B0E11]/60 backdrop-blur-md border-2 border-[#1CEAB9] shadow-lg text-white flex flex-col items-center"
          >
            {icon}
            <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
            <p className="text-sm text-gray-300 text-center">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
