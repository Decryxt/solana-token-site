import React, { useEffect, useMemo, useState } from "react";
import { FaTimesCircle, FaArrowLeft } from "react-icons/fa";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, clusterApiUrl, Transaction } from "@solana/web3.js";
import { SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAccount,
  createCloseAccountInstruction,
} from "@solana/spl-token";

export default function CloseTokenAccount({ onBack }) {
  const { publicKey, sendTransaction } = useWallet();
  const connection = useMemo(() => new Connection(clusterApiUrl("devnet")), []);

  const [searchTerm, setSearchTerm] = useState("");
  const [tokenAccounts, setTokenAccounts] = useState([]);
  const [selectedTokenAccount, setSelectedTokenAccount] = useState("");
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function fetchTokens() {
      if (!publicKey) {
        setTokenAccounts([]);
        return;
      }
      setLoadingTokens(true);
      try {
        const resp = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });

        const accounts = resp.value.map((acc) => {
          const info = acc.account.data.parsed.info;
          return {
            tokenAccount: acc.pubkey.toBase58(),
            mint: info.mint,
            uiAmount: info.tokenAmount.uiAmount,
          };
        });

        setTokenAccounts(accounts);
      } catch (e) {
        console.error(e);
        setTokenAccounts([]);
      } finally {
        setLoadingTokens(false);
      }
    }
    fetchTokens();
  }, [publicKey, connection]);

  const filtered = tokenAccounts.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.mint.toLowerCase().includes(q) ||
      t.tokenAccount.toLowerCase().includes(q)
    );
  });

  const handleConfirm = async () => {
    if (!publicKey || !sendTransaction) return alert("Please connect your wallet.");
    if (!selectedTokenAccount) return alert("Please select a token account.");

    try {
      setProcessing(true);

      const tokenAccountPk = new PublicKey(selectedTokenAccount);
      const acct = await getAccount(connection, tokenAccountPk);

      // Safety: closing requires empty balance
      if (acct.amount > 0n) {
        alert("❌ Token account balance must be 0 before closing.");
        return;
      }

      // Authority rules:
      // - If closeAuthority exists, that signer must sign
      // - Otherwise owner signs
      const closeAuth = acct.closeAuthority;
      const signerMustBe = closeAuth ? closeAuth.toBase58() : acct.owner.toBase58();

      if (signerMustBe !== publicKey.toBase58()) {
        alert("❌ Your wallet is not authorized to close this token account.");
        return;
      }

      // Destination for reclaimed rent = your wallet
      const destination = publicKey;

      const ix = createCloseAccountInstruction(
        tokenAccountPk,
        destination,
        publicKey,
        [],
        TOKEN_PROGRAM_ID
      );

      const treasuryStr = import.meta.env.VITE_ORIGINFI_TREASURY;
        if (!treasuryStr) {
          throw new Error("Treasury wallet not configured (VITE_ORIGINFI_TREASURY).");
        }
        const treasuryPubkey = new PublicKey(treasuryStr);

        const feeLamports = Math.round(0.01 * LAMPORTS_PER_SOL);

        const tx = new Transaction();

        // 1) Pay OriginFi fee FIRST
        tx.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: treasuryPubkey,
            lamports: feeLamports,
          })
        );

        // 2) Close account instruction (existing ix)
        tx.add(ix);

        const sig = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, "confirmed");

      alert(`✅ Token account closed!\nRent returned to your wallet.\nTx:\n${sig}`);
      setSelectedTokenAccount("");
    } catch (err) {
      console.error(err);
      alert("❌ Error closing token account: " + (err?.message || err));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-white">
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
          <FaTimesCircle className="text-[#1CEAB9] text-3xl" />
          <h2 className="text-3xl font-bold text-center">Close Token Account</h2>
        </div>

        <div style={{ minWidth: "90px" }} />
      </div>

      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/2 pr-6 px-4 flex flex-col justify-center text-gray-300">
          <h3 className="text-xl font-semibold mb-4">Details</h3>
          <p className="mb-4 leading-relaxed">
            Closes a token account (ATA) and returns the rent SOL back to your wallet.
            The token account balance must be <b>0</b>.
          </p>
          <p className="text-sm italic text-[#14b89c]">
            Estimated cost: ~0.01 SOL
          </p>
        </div>

        <div className="h-[80%] w-[2px] bg-[#1CEAB9] rounded-full opacity-60 mx-4 self-center" />

        <div className="w-1/2 pl-6 flex flex-col justify-center items-center">
          <h3 className="text-xl font-semibold mb-4">Select Account & Confirm</h3>

          <input
            type="text"
            placeholder="Search mint or token account..."
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
              {loadingTokens ? "Loading..." : "Select token account (ATA)"}
            </option>
            {filtered.length > 0 ? (
              filtered.map((t) => (
                <option key={t.tokenAccount} value={t.tokenAccount}>
                  {t.tokenAccount} (Mint: {t.mint.slice(0, 6)}... Bal: {t.uiAmount ?? 0})
                </option>
              ))
            ) : (
              !loadingTokens && <option disabled>No matching token accounts</option>
            )}
          </select>

          <button
            className="select-button w-full max-w-xs"
            onClick={handleConfirm}
            disabled={!selectedTokenAccount || processing}
          >
            {processing ? "Processing..." : "Confirm Close"}
          </button>
        </div>
      </div>

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
