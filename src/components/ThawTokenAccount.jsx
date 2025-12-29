import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAccount,
  createThawAccountInstruction,
} from "@solana/spl-token";

export default function ThawTokenAccount({ onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tokenAccounts, setTokenAccounts] = useState([]);
  const [selectedTokenAccount, setSelectedTokenAccount] = useState("");
  const [processing, setProcessing] = useState(false);

  const { publicKey, sendTransaction } = useWallet();
  const connection = new Connection(clusterApiUrl("devnet"));

  useEffect(() => {
    async function fetchTokens() {
      if (!publicKey) {
        setTokenAccounts([]);
        return;
      }
      try {
        const response = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });

        const tokens = response.value
          .filter((acc) => {
            const amount = acc.account.data.parsed.info.tokenAmount.uiAmount;
            const state = acc.account.data.parsed.info.state;
            return amount > 0 && state === "frozen";
          })
          .map((acc) => ({
            pubkey: acc.pubkey.toBase58(),
            mint: acc.account.data.parsed.info.mint,
            amount: acc.account.data.parsed.info.tokenAmount.uiAmount,
          }));

        setTokenAccounts(tokens);
      } catch (err) {
        console.error("Error fetching frozen token accounts:", err);
        setTokenAccounts([]);
      }
    }

    fetchTokens();
  }, [publicKey]);

  const filteredTokens = tokenAccounts.filter((token) =>
    token.mint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = async () => {
    if (!selectedTokenAccount) {
      alert("Please select a frozen token account to thaw.");
      return;
    }
    if (!publicKey || !sendTransaction) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      setProcessing(true);
      console.log("Starting thaw transaction...");

      const tokenAccountPubkey = new PublicKey(selectedTokenAccount);

      const tokenAccountInfo = await getAccount(connection, tokenAccountPubkey);

      const mintPubkey = new PublicKey(tokenAccountInfo.mint);
      const mintData = await connection.getParsedAccountInfo(mintPubkey);
      const mintParsed = mintData.value.data.parsed.info;
      const freezeAuthority = mintParsed.freezeAuthority;

      if (!freezeAuthority) {
        alert("This token's freeze authority is revoked or not set.");
        setProcessing(false);
        return;
      }

      if (freezeAuthority !== publicKey.toBase58()) {
        alert("Your wallet is NOT the freeze authority of this token mint.");
        setProcessing(false);
        return;
      }

      const ix = createThawAccountInstruction(tokenAccountPubkey, mintPubkey, publicKey);

      const treasuryStr = import.meta.env.VITE_ORIGINFI_TREASURY;
      if (!treasuryStr) {
        throw new Error("Treasury wallet not configured (VITE_ORIGINFI_TREASURY).");
      }
      const treasuryPubkey = new PublicKey(treasuryStr);

      const feeLamports = Math.round(0.02 * LAMPORTS_PER_SOL);

      const tx = new Transaction();

      // 1) Pay OriginFi fee FIRST
      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: feeLamports,
        })
      );

      // 2) Thaw instruction
      tx.add(ix);

      console.log("Sending transaction to wallet...");

      // Timeout wrapper to avoid infinite hang
      const sendTxPromise = sendTransaction(tx, connection);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("sendTransaction timed out after 15 seconds")), 15000)
      );

      const sig = await Promise.race([sendTxPromise, timeoutPromise]);
      console.log("Transaction signature:", sig);

      // Confirm transaction (use latest API signature format)
      await connection.confirmTransaction({ signature: sig, commitment: "confirmed" });

      alert(`✅ Token account thawed!\nTransaction Signature:\n${sig}`);
      setSelectedTokenAccount("");
    } catch (err) {
      console.error("Error in handleConfirm:", err);
      alert("❌ Error thawing token account: " + (err.message || err));
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
          <FaShieldAlt className="text-[#1CEAB9] text-3xl" />
          <h2 className="text-3xl font-bold text-center">Thaw Token Account</h2>
        </div>

        <div style={{ minWidth: "90px" }}></div>
      </div>

      {/* Main content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Left side */}
        <div className="w-1/2 pr-6 px-4 flex flex-col justify-center text-gray-300">
          <h3 className="text-xl font-semibold mb-4">Details</h3>
          <p className="mb-4 leading-relaxed">
            Thawing a frozen token account re-enables transfers for that account.
            Only the freeze authority of the token mint can perform this action.
          </p>
          <p className="text-sm italic text-[#14b89c]">Estimated cost: ~0.02 SOL</p>
        </div>

        {/* Divider */}
        <div className="h-[80%] w-[2px] bg-[#1CEAB9] rounded-full opacity-60 mx-4 self-center"></div>

        {/* Right side */}
        <div className="w-1/2 pl-6 flex flex-col justify-center items-center">
          <h3 className="text-xl font-semibold mb-4">Select Frozen Account & Confirm</h3>

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
            value={selectedTokenAccount}
            onChange={(e) => setSelectedTokenAccount(e.target.value)}
            disabled={processing}
          >
            <option disabled value="">
              {tokenAccounts.length === 0 ? "No frozen tokens found" : "Select a frozen account"}
            </option>
            {filteredTokens.length > 0 &&
              filteredTokens.map(({ pubkey, mint, amount }) => (
                <option key={pubkey} value={pubkey}>
                  {mint} — Balance: {amount}
                </option>
              ))}
          </select>

          <button
            className="select-button w-full max-w-xs"
            onClick={handleConfirm}
            disabled={!selectedTokenAccount || processing}
          >
            {processing ? "Processing..." : "Thaw Account"}
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
