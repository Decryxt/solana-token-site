import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Buffer } from "buffer";
import { WebUploader } from "@irys/web-upload";
import { WebSolana } from "@irys/web-upload-solana";
import {
  FaTimes,
  FaCheckCircle,
  FaRegCircle,
  FaSpinner,
  FaCopy,
  FaExternalLinkAlt,
} from "react-icons/fa";
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
    makeMetadataImmutable: false,
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);

  const setStatusMessage = (msg) => {
    setStatus(String(msg || ""));
    setStatusOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imageFile") {
      if (files && files[0]) {
        const url = URL.createObjectURL(files[0]);
        setFormData((prev) => ({
          ...prev,
          imageURI: url,     // preview
          imageFile: files[0] // ✅ real file for upload
        }));
      }
    }
 else {
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

  async function uploadToIrys({
    name,
    symbol,
    description,
    imageFile,
    wallet,
    rpcUrl,
  }) {
    if (!wallet) throw new Error("Wallet not connected");
    if (!rpcUrl) throw new Error("Missing RPC URL");

    const irys = await WebUploader(WebSolana)
      .withProvider(wallet)
      .withRpc(rpcUrl)
      .mainnet();

    // Upload image
    const mime = imageFile?.type || "image/png";
    const imgReceipt = await irys.uploadFile(imageFile, {
      tags: [{ name: "Content-Type", value: mime }],
    });

    const imageUrl = `https://gateway.irys.xyz/${imgReceipt.id}`;

    // Upload metadata JSON
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setStatusOpen(false);

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
      const network = "mainnet-beta";
      const rpc = import.meta.env.VITE_SOLANA_RPC;
      const connection = new Connection(rpc, "confirmed");

      setLoading(true);
      setStatusMessage("Building transaction...");

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
      if (!formData.imageFile) {
        alert("Please upload a logo image first.");
        return;
      }

      setStatusMessage("Uploading metadata...");

      const { metadataUrl } = await uploadToIrys({
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        imageFile: formData.imageFile,
        wallet: wallet,
        rpcUrl: import.meta.env.VITE_SOLANA_RPC,
      });

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

      // Mint account must sign; user signs via wallet
      tx.partialSign(mintKeypair);

      setStatusMessage("Please approve the transaction in your wallet...");

      const sig = await sendTransaction(tx, connection);

      setStatusMessage("Confirming transaction on Solana...");

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
        setStatusMessage("Transaction failed. See console for details.");
        return;
      }

      // ---- Save to OriginFi backend (verify + store) ----
      // NOTE: We keep all metadata fields here so later we can wire Metaplex.
      setStatusMessage("Saving token to OriginFi...");

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
        console.error("Confirm mint error:", data);
        const message = data?.error || data?.details || "Failed to save token.";
        setStatusMessage(`Failed to save token: ${message}`);
        alert(`Mint succeeded, but saving failed: ${message}`);
        return;
      }

      setStatusMessage(
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
      setStatusMessage("Unexpected error while creating token. Check console.");
      alert("Unexpected error while creating token. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const cardsData = [
    {
      title: "On-Chain Metadata",
      text: "Your token’s name, symbol, image, and description are stored via Metaplex so wallets and explorers can display it properly.",
      icon: <FaInfoCircle className="text-[#1CEAB9] text-4xl mb-4" />,
    },
    {
      title: "Metadata Immutability",
      text: "You can permanently lock your token metadata to prevent future edits. This is a real on-chain trust signal.",
      icon: <FaMoneyBillWave className="text-[#1CEAB9] text-4xl mb-4" />,
    },
    {
      title: "Authority Actions",
      text: "Mint & freeze authority actions happen in your Token Dashboard (revoke, freeze/thaw, delegate, and more).",
      icon: <FaUsers className="text-[#1CEAB9] text-4xl mb-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex items-start justify-center px-6 py-8 gap-10 bg-transparent">
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

          {/* Metadata immutability (replaces royalties/creators) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300 mb-1">Metadata Settings</label>

            <div className="flex items-start gap-3 bg-[#12161C] border border-[#1CEAB9]/20 rounded-lg p-4">
              <input
                type="checkbox"
                checked={formData.makeMetadataImmutable}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    makeMetadataImmutable: e.target.checked,
                  }))
                }
                className="mt-1"
              />

              <div className="flex-1">
                <p className="text-sm text-white font-medium">Make metadata immutable</p>
                <p className="text-xs text-gray-400 mt-1">
                  Locks name, symbol, image, and description permanently. This is irreversible.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#1CEAB9] via-[#17d1a6] to-[#0bc4a1] text-black font-semibold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Token..." : "Mint Token  /  Estimated 0.05 SOL"}
          </button>
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

      {/* Status modal (professional mint console) */}
      {statusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close status"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setStatusOpen(false)}
            disabled={loading} // optional: prevents closing mid-mint
          />

          <div className="relative w-full max-w-3xl mx-6 rounded-3xl border border-[#1CEAB9]/50 bg-[#0B0E11] shadow-2xl text-white overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#1CEAB9]/15 flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold tracking-tight">Mint Console</div>
                <div className="text-xs text-gray-400 mt-1">
                  Live progress + final receipt for your token mint
                </div>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setStatusOpen(false)}
                disabled={loading} // optional: prevents closing mid-mint
                className="h-10 w-10 grid place-items-center rounded-full border border-[#1CEAB9]/30 bg-[#12161C] text-white hover:bg-[#144f44] hover:text-[#1CEAB9] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaTimes />
              </button>
            </div>

            {(() => {
              // ---------- small helpers (no extra state needed) ----------
              const s = String(status || "");

              const steps = [
                { key: "build", label: "Building transaction", match: /Building transaction/i },
                { key: "upload", label: "Uploading metadata", match: /Uploading metadata/i },
                { key: "approve", label: "Awaiting wallet approval", match: /approve|wallet/i },
                { key: "confirm", label: "Confirming on Solana", match: /Confirming transaction/i },
                { key: "save", label: "Saving to OriginFi", match: /Saving token to OriginFi/i },
                { key: "done", label: "Completed", match: /Token minted and saved|Token minted\./i },
              ];

              // current step index based on status text
              let currentIdx = 0;
              for (let i = 0; i < steps.length; i++) {
                if (steps[i].match.test(s)) currentIdx = i;
              }
              if (!s) currentIdx = 0;

              // Parse receipt fields from your final status lines (Mint:, ATA:, Tx:)
              const mint = (s.match(/Mint:\s*([A-Za-z0-9]{32,})/i) || [])[1] || "";
              const ata = (s.match(/ATA:\s*([A-Za-z0-9]{32,})/i) || [])[1] || "";
              const tx = (s.match(/Tx:\s*([A-Za-z0-9]{32,})/i) || [])[1] || "";

              const isDone = /Token minted and saved|Token minted\./i.test(s);
              const network = "mainnet-beta"; // matches your current config

              const copy = async (text) => {
                try {
                  await navigator.clipboard.writeText(text);
                } catch (e) {
                  console.error("Copy failed:", e);
                }
              };

              const explorerTxUrl =
                tx ? `https://explorer.solana.com/tx/${tx}` : "";
              const explorerMintUrl =
                mint ? `https://explorer.solana.com/address/${mint}` : "";

              return (
                <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LEFT: Step tracker */}
                  <div className="rounded-2xl border border-[#1CEAB9]/15 bg-[#0D1116] p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Progress</div>

                      {loading ? (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <FaSpinner className="animate-spin" />
                          Working…
                        </div>
                      ) : isDone ? (
                        <div className="flex items-center gap-2 text-xs text-[#1CEAB9]">
                          <FaCheckCircle />
                          Done
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">Idle</div>
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      {steps.map((st, i) => {
                        const completed = i < currentIdx || (isDone && i <= currentIdx);
                        const active = i === currentIdx && loading;

                        return (
                          <div key={st.key} className="flex items-center gap-3">
                            <div className="w-5 h-5 grid place-items-center">
                              {completed ? (
                                <FaCheckCircle className="text-[#1CEAB9]" />
                              ) : active ? (
                                <FaSpinner className="animate-spin text-[#1CEAB9]" />
                              ) : (
                                <FaRegCircle className="text-gray-600" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div
                                className={[
                                  "text-sm",
                                  completed ? "text-white" : active ? "text-white" : "text-gray-400",
                                ].join(" ")}
                              >
                                {st.label}
                              </div>

                              {active && (
                                <div className="text-xs text-gray-500 mt-0.5 animate-pulse">
                                  In progress…
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#1CEAB9]/10">
                      <div className="text-xs text-gray-400 whitespace-pre-wrap">
                        {status || "Waiting for your first action…"}
                      </div>

                      {loading && (
                        <div className="mt-3 text-[11px] text-gray-500">
                          You can leave this open while approving in your wallet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Receipt / Details */}
                  <div className="rounded-2xl border border-[#1CEAB9]/15 bg-[#0D1116] p-5">
                    <div className="text-sm font-semibold">Receipt</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Final details appear automatically when mint completes
                    </div>

                    <div className="mt-4 space-y-3">
                      {/* Network */}
                      <div className="flex items-start justify-between gap-3 rounded-xl border border-[#1CEAB9]/10 bg-[#0B0E11] p-3">
                        <div>
                          <div className="text-[11px] text-gray-500">Network</div>
                          <div className="text-sm text-white">{network}</div>
                        </div>
                      </div>

                      {/* Mint */}
                      <div className="flex items-start justify-between gap-3 rounded-xl border border-[#1CEAB9]/10 bg-[#0B0E11] p-3">
                        <div className="min-w-0">
                          <div className="text-[11px] text-gray-500">Mint Address</div>
                          <div className="text-xs text-gray-200 break-all">
                            {mint || "—"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => mint && copy(mint)}
                            disabled={!mint}
                            className="h-9 px-3 rounded-lg border border-[#1CEAB9]/20 bg-[#12161C] text-xs hover:bg-[#144f44] hover:text-[#1CEAB9] transition disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Copy mint"
                          >
                            <FaCopy className="inline mr-2" />
                            Copy
                          </button>

                          <a
                            href={explorerMintUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              if (!explorerMintUrl) e.preventDefault();
                            }}
                            className={[
                              "h-9 px-3 rounded-lg border border-[#1CEAB9]/20 bg-[#12161C] text-xs transition",
                              explorerMintUrl
                                ? "hover:bg-[#144f44] hover:text-[#1CEAB9]"
                                : "opacity-40 cursor-not-allowed",
                            ].join(" ")}
                            title="View mint on Explorer"
                          >
                            <FaExternalLinkAlt className="inline mr-2" />
                            Explorer
                          </a>
                        </div>
                      </div>

                      {/* ATA */}
                      <div className="flex items-start justify-between gap-3 rounded-xl border border-[#1CEAB9]/10 bg-[#0B0E11] p-3">
                        <div className="min-w-0">
                          <div className="text-[11px] text-gray-500">Token Account (ATA)</div>
                          <div className="text-xs text-gray-200 break-all">
                            {ata || "—"}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => ata && copy(ata)}
                          disabled={!ata}
                          className="h-9 px-3 rounded-lg border border-[#1CEAB9]/20 bg-[#12161C] text-xs hover:bg-[#144f44] hover:text-[#1CEAB9] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                          title="Copy ATA"
                        >
                          <FaCopy className="inline mr-2" />
                          Copy
                        </button>
                      </div>

                      {/* Tx */}
                      <div className="flex items-start justify-between gap-3 rounded-xl border border-[#1CEAB9]/10 bg-[#0B0E11] p-3">
                        <div className="min-w-0">
                          <div className="text-[11px] text-gray-500">Transaction</div>
                          <div className="text-xs text-gray-200 break-all">
                            {tx || "—"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => tx && copy(tx)}
                            disabled={!tx}
                            className="h-9 px-3 rounded-lg border border-[#1CEAB9]/20 bg-[#12161C] text-xs hover:bg-[#144f44] hover:text-[#1CEAB9] transition disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Copy tx"
                          >
                            <FaCopy className="inline mr-2" />
                            Copy
                          </button>

                          <a
                            href={explorerTxUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              if (!explorerTxUrl) e.preventDefault();
                            }}
                            className={[
                              "h-9 px-3 rounded-lg border border-[#1CEAB9]/20 bg-[#12161C] text-xs transition",
                              explorerTxUrl
                                ? "hover:bg-[#144f44] hover:text-[#1CEAB9]"
                                : "opacity-40 cursor-not-allowed",
                            ].join(" ")}
                            title="View tx on Explorer"
                          >
                            <FaExternalLinkAlt className="inline mr-2" />
                            Explorer
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#1CEAB9]/10 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {isDone ? "Mint complete." : loading ? "Minting in progress…" : "Ready."}
                      </div>

                      <button
                        type="button"
                        onClick={() => setStatusOpen(false)}
                        className="h-10 px-4 rounded-xl border border-[#1CEAB9]/30 bg-[#12161C] text-sm hover:bg-[#144f44] hover:text-[#1CEAB9] transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
     </div>
  );
}

