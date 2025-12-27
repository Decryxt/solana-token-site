import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { FaInfoCircle, FaMoneyBillWave, FaUsers } from "react-icons/fa";
import { getAuth } from "../authStorage";

export default function TokenCreationForm() {
  const wallet = useWallet();
  const { publicKey } = wallet;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!publicKey) {
      alert("❌ Please connect your wallet first.");
      return;
    }

    const auth = getAuth();
    const token = auth?.token;

    if (!token) {
      alert("❌ You must be logged in to create a token.");
      return;
    }

    if (!formData.supply || Number(formData.supply) <= 0) {
      alert("❌ Please enter a valid total supply.");
      return;
    }

    try {
      setLoading(true);
      setStatus("⏳ Creating token on OriginFi backend...");

      const apiBase = import.meta.env.VITE_API_URL;

      const body = {
        name: formData.name,
        symbol: formData.symbol,
        decimals: Number(formData.decimals),
        initialSupply: String(formData.supply),
        network: "devnet", // for now
        ownerWallet: publicKey.toBase58(),
        // In the future we can add:
        // description: formData.description,
        // imageURI: formData.imageURI,
        // sellerFeeBasisPoints: Number(formData.sellerFeeBasisPoints),
        // creators: formData.creators.split(",").map((c) => c.trim()).filter(Boolean),
      };

      const res = await fetch(`${apiBase}/api/token/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // IMPORTANT for requireAuth
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        console.error("Create token error:", data);
        const message =
          data?.error || data?.details || "Failed to create token.";
        setStatus(`❌ ${message}`);
        alert(`❌ Failed to create token.\n${message}`);
        return;
      }

      // Backend shape: { ok: true, token, onchain }
      const { onchain } = data;

      setStatus(
        [
          "✅ Token minted on Solana and saved to OriginFi.",
          `Mint: ${onchain.mintAddress}`,
          `ATA: ${onchain.ata}`,
          `Tx: ${onchain.txSignature}`,
        ].join("\n")
      );

      console.log("Token created:", data);

      alert(
        `✅ Token minted on Solana.\nMint: ${onchain.mintAddress}\nTx: ${onchain.txSignature}`
      );
    } catch (err) {
      console.error("❌ Error calling /api/token/create:", err);
      setStatus("❌ Unexpected error while creating token. Check console.");
      alert("❌ Unexpected error while creating token. Check console.");
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
