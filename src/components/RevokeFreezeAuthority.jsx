import React, { useState, useEffect } from "react";
import { FaSnowflake, FaArrowLeft } from "react-icons/fa";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getMint,
  createSetAuthorityInstruction,
  AuthorityType,
} from "@solana/spl-token";

export default function RevokeFreezeAuthority({ onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tokenAccounts, setTokenAccounts] = useState([]);
  const [selectedMint, setSelectedMint] = useState("");
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { publicKey, sendTransaction } = useWallet();
  const connection = new Connection(clusterApiUrl("devnet"));

  useEffect(() => {
    async function fetchTokens() {
      if (!publicKey) {
        setTokenAccounts([]);
        return;
      }
      setLoadingTokens(true);
      try {
        const response = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });
        const tokens = response.value
          .filter((accountInfo) => accountInfo.account.data.parsed.info.tokenAmount.uiAmount > 0)
          .map((accountInfo) => ({
            mint: accountInfo.account.data.parsed.info.mint,
            amount: accountInfo.account.data.parsed.info.tokenAmount.uiAmount,
          }));
        setTokenAccounts(tokens);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setTokenAccounts([]);
      } finally {
        setLoadingTokens(false);
      }
    }
    fetchTokens();
  }, [publicKey]);

  const filteredTokens = tokenAccounts.filter((token) =>
    token.mint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = async () => {
    if (!selectedMint) {
      alert("Please select a token mint address.");
      return;
    }
    if (!publicKey || !sendTransaction) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      setProcessing(true);
      const mintPubkey = new PublicKey(selectedMint);
      const mintInfo = await getMint(connection, mintPubkey);

      // Pre-check: Is freeze authority already revoked?
      if (!mintInfo.freezeAuthority) {
        alert("⚠️ Freeze authority is already revoked.");
        setProcessing(false);
        return;
      }

      // Pre-check: Does the connected wallet control freeze authority?
      if (mintInfo.freezeAuthority.toBase58() !== publicKey.toBase58()) {
        alert("❌ Your connected wallet is NOT the freeze authority of this token.");
        setProcessing(false);
        return;
      }

      const ix = createSetAuthorityInstruction(
        mintPubkey,
        publicKey,
        AuthorityType.FreezeAccount,
        null // revoke authority
      );

      const tx = new Transaction().add(ix);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");

      alert(`✅ Freeze authority revoked!\nTransaction Signature:\n${sig}`);
      setSelectedMint("");
    } catch (err) {
      console.error(err);
      alert("❌ Error revoking freeze authority: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 relative">
        <button
          className="select-button flex items-center space-x-2 px-3 py-1"
          onClick={onBack}
          disabled={processing}
          style={{ minWidth: "90px" }}
        >
          <FaArrowLeft className="text-[#1CEAB9]" />
          <span>Back</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-3 pointer-events-none">
          <FaSnowflake className="text-[#1CEAB9] text-3xl" />
          <h2 className="text-3xl font-bold text-center">Revoke Freeze Authority</h2>
        </div>

        <div style={{ minWidth: "90px" }}></div>
      </div>

      {/* Main content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Left side */}
        <div className="w-1/2 pr-6 px-4 flex flex-col justify-center text-gray-300">
          <h3 className="text-xl font-semibold mb-4">Details</h3>
          <p className="mb-4 leading-relaxed">
            Revoking freeze authority prevents future freezing of token accounts. Only the current freeze authority can perform this action.
          </p>
          <p className="text-sm italic text-[#14b89c]">Estimated cost: ~0.04 SOL</p>
        </div>

        {/* Divider */}
        <div className="h-[80%] w-[2px] bg-[#1CEAB9] rounded-full opacity-60 mx-4 self-center"></div>

        {/* Right side */}
        <div className="w-1/2 pl-6 flex flex-col justify-center items-center">
          <h3 className="text-xl font-semibold mb-4">Select Token & Confirm</h3>

          <input
            type="text"
            placeholder="Search token mint address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 w-full max-w-xs bg-[#121619] border border-[#1CEAB9] rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
            disabled={processing}
          />

          <select
            className="mb-6 w-full max-w-xs bg-[#121619] border border-[#1CEAB9] rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
            value={selectedMint}
            onChange={(e) => setSelectedMint(e.target.value)}
            disabled={processing}
          >
            <option disabled value="">
              {loadingTokens ? "Loading tokens..." : "Select your token mint address"}
            </option>
            {filteredTokens.length > 0 ? (
              filteredTokens.map(({ mint, amount }) => (
                <option key={mint} value={mint}>
                  {mint} (Balance: {amount})
                </option>
              ))
            ) : (
              !loadingTokens && <option disabled>No matching tokens</option>
            )}
          </select>

          <button
            className="select-button w-full max-w-xs"
            onClick={handleConfirm}
            disabled={!selectedMint || processing}
          >
            {processing ? "Processing..." : "Confirm Revoke"}
          </button>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .select-button {
          padding: 0.5rem 1.5rem;
          border-radius: 9999px;
          font-weight: 600;
          color: white;
          background-color: #0b0e11;
          border: 2px solid #14b89c;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.3s ease, transform 0.3s ease;
          font-size: 0.9rem;
        }
        .select-button:hover {
          background-color: #144f44;
          color: #1ceab9;
          transform: scale(1.05);
        }
        .select-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
