import React, { useEffect, useMemo, useState } from "react";
import { FaRegHandshake, FaArrowLeft } from "react-icons/fa";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, clusterApiUrl, Transaction } from "@solana/web3.js";
import { SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getMint,
  getAccount,
  createSetAuthorityInstruction,
  AuthorityType,
} from "@solana/spl-token";

export default function SetAuthority({ onBack }) {
  const { publicKey, sendTransaction } = useWallet();
  
  const connection = useMemo(() => {
    const rpc = import.meta.env.VITE_SOLANA_RPC;
    if (!rpc) throw new Error("Missing VITE_SOLANA_RPC in .env");
    return new Connection(rpc, "confirmed");
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [tokenAccounts, setTokenAccounts] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  const [authorityType, setAuthorityType] = useState("MintTokens"); // MintTokens | FreezeAccount | AccountOwner | CloseAccount
  const [selectedTarget, setSelectedTarget] = useState(""); // mint for mint/freeze, tokenAccount for owner/close
  const [newAuthority, setNewAuthority] = useState(""); // address, or blank if revoking
  const [revokeToNull, setRevokeToNull] = useState(false);

  const [processing, setProcessing] = useState(false);

  // Fetch token accounts owned by wallet (we need these for AccountOwner/CloseAccount types)
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
            amount: info.tokenAmount.uiAmount,
          };
        });

        setTokenAccounts(accounts);
      } catch (e) {
        console.error("Error fetching token accounts:", e);
        setTokenAccounts([]);
      } finally {
        setLoadingTokens(false);
      }
    }
    fetchTokens();
  }, [publicKey, connection]);

  const isMintAuthorityType =
    authorityType === "MintTokens" || authorityType === "FreezeAccount";

  const filteredTargets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return tokenAccounts;
    return tokenAccounts.filter(
      (t) =>
        t.mint.toLowerCase().includes(q) ||
        t.tokenAccount.toLowerCase().includes(q)
    );
  }, [tokenAccounts, searchTerm]);

  const handleConfirm = async () => {
    if (!publicKey || !sendTransaction) {
      alert("Please connect your wallet.");
      return;
    }

    if (!selectedTarget) {
      alert(isMintAuthorityType ? "Please select a mint." : "Please select a token account.");
      return;
    }

    // If not revoking, require new authority address
    if (!revokeToNull) {
      if (!newAuthority.trim()) {
        alert("Please enter the new authority wallet address.");
        return;
      }
      try {
        new PublicKey(newAuthority.trim());
      } catch {
        alert("Invalid new authority address.");
        return;
      }
    }

    try {
      setProcessing(true);

      let ix;
      if (isMintAuthorityType) {
        // Target is a mint
        const mintPubkey = new PublicKey(selectedTarget);
        const mintInfo = await getMint(connection, mintPubkey);

        const currentAuth =
          authorityType === "MintTokens" ? mintInfo.mintAuthority : mintInfo.freezeAuthority;

        if (!currentAuth) {
          alert("⚠️ That authority is already revoked on this mint.");
          return;
        }
        if (currentAuth.toBase58() !== publicKey.toBase58()) {
          alert("❌ Your connected wallet does NOT control this authority.");
          return;
        }

        ix = createSetAuthorityInstruction(
          mintPubkey,
          publicKey,
          AuthorityType[authorityType],
          revokeToNull ? null : new PublicKey(newAuthority.trim()),
          [],
          TOKEN_PROGRAM_ID
        );
      } else {
        // Target is a token account
        const tokenAccountPubkey = new PublicKey(selectedTarget);
        const acct = await getAccount(connection, tokenAccountPubkey);

        // For AccountOwner, the current owner must sign. That's just your wallet.
        // For CloseAccount authority, SPL supports a closeAuthority. If it exists, that signer must sign.
        if (authorityType === "CloseAccount") {
          const closeAuth = acct.closeAuthority;
          if (closeAuth && closeAuth.toBase58() !== publicKey.toBase58()) {
            alert("❌ Your wallet is NOT the close authority for this token account.");
            return;
          }
          if (!closeAuth && acct.owner.toBase58() !== publicKey.toBase58()) {
            // If no closeAuthority set, owner is effectively the authority that can set it (with signer)
            alert("❌ Your wallet is NOT the owner of this token account.");
            return;
          }
        } else if (authorityType === "AccountOwner") {
          if (acct.owner.toBase58() !== publicKey.toBase58()) {
            alert("❌ Your wallet is NOT the owner of this token account.");
            return;
          }
          if (revokeToNull) {
            alert("⚠️ You cannot revoke AccountOwner to null. You must set a new owner.");
            return;
          }
        }

        ix = createSetAuthorityInstruction(
          tokenAccountPubkey,
          publicKey,
          AuthorityType[authorityType],
          revokeToNull ? null : new PublicKey(newAuthority.trim()),
          [],
          TOKEN_PROGRAM_ID
        );
      }

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

        // 2) Set authority instruction (existing ix)
        tx.add(ix);

// keep your existing send/confirm code exactly as-is below this
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");

      alert(`✅ Authority updated!\nTransaction:\n${sig}`);
      setSelectedTarget("");
      setNewAuthority("");
      setRevokeToNull(false);
    } catch (err) {
      console.error(err);
      alert("❌ Error setting authority: " + (err?.message || err));
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
          <FaRegHandshake className="text-[#1CEAB9] text-3xl" />
          <h2 className="text-3xl font-bold text-center">Set Authority</h2>
        </div>

        <div style={{ minWidth: "90px" }} />
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Left details */}
        <div className="w-1/2 pr-6 px-4 flex flex-col justify-center text-gray-300">
          <h3 className="text-xl font-semibold mb-4">Details</h3>
          <p className="mb-3 leading-relaxed">
            Set or change SPL authorities. Mint/Freeze authorities apply to the <b>Mint</b>.
            Owner/Close authorities apply to a <b>Token Account (ATA)</b>.
          </p>

          <div className="mt-2 space-y-3">
            <div>
              <div className="text-sm text-gray-400 mb-1">Authority Type</div>
              <select
                className="w-full bg-[#121619] border border-[#1CEAB9] rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
                value={authorityType}
                onChange={(e) => {
                  setAuthorityType(e.target.value);
                  setSelectedTarget("");
                  setSearchTerm("");
                  setNewAuthority("");
                  setRevokeToNull(false);
                }}
                disabled={processing}
              >
                <option value="MintTokens">Mint Authority (MintTokens)</option>
                <option value="FreezeAccount">Freeze Authority (FreezeAccount)</option>
                <option value="AccountOwner">Token Account Owner (AccountOwner)</option>
                <option value="CloseAccount">Token Account Close Authority (CloseAccount)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={revokeToNull}
                onChange={(e) => setRevokeToNull(e.target.checked)}
                disabled={processing || authorityType === "AccountOwner" || isMintAuthorityType}
              />
              <span className="text-sm">
                Revoke authority (set to <b>null</b>)
                {authorityType === "AccountOwner" && (
                  <span className="text-xs text-gray-500 ml-2">(not allowed for AccountOwner)</span>
                )}
              </span>
            </div>

            <p className="text-sm italic text-[#14b89c]">
              Estimated cost: ~0.02 SOL
            </p>
          </div>
        </div>

        <div className="h-[80%] w-[2px] bg-[#1CEAB9] rounded-full opacity-60 mx-4 self-center" />

        {/* Right select/confirm */}
        <div className="w-1/2 pl-6 flex flex-col justify-center items-center">
          <h3 className="text-xl font-semibold mb-4">Select Target & Confirm</h3>

          <input
            type="text"
            placeholder={isMintAuthorityType ? "Search mint address..." : "Search mint or token account..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 w-full max-w-xs bg-[#121619] border border-[#1CEAB9] rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
            disabled={processing}
          />

          <select
            className="mb-4 w-full max-w-xs bg-[#121619] border border-[#1CEAB9] rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            disabled={processing}
          >
            <option disabled value="">
              {loadingTokens ? "Loading..." : isMintAuthorityType ? "Select mint (from your wallet tokens)" : "Select token account (ATA)"}
            </option>

            {filteredTargets.length > 0 ? (
              filteredTargets.map((t) => (
                <option
                  key={t.tokenAccount}
                  value={isMintAuthorityType ? t.mint : t.tokenAccount}
                >
                  {isMintAuthorityType
                    ? `${t.mint} (Bal: ${t.amount ?? 0})`
                    : `${t.tokenAccount} (Mint: ${t.mint.slice(0, 6)}... , Bal: ${t.amount ?? 0})`}
                </option>
              ))
            ) : (
              !loadingTokens && <option disabled>No matching tokens</option>
            )}
          </select>

          <input
            type="text"
            placeholder={revokeToNull ? "Revoking to null (no address needed)" : "New authority wallet address"}
            value={newAuthority}
            onChange={(e) => setNewAuthority(e.target.value)}
            className="mb-6 w-full max-w-xs bg-[#121619] border border-[#1CEAB9] rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
            disabled={processing || revokeToNull}
          />

          <button
            className="select-button w-full max-w-xs"
            onClick={handleConfirm}
            disabled={!selectedTarget || processing || (!revokeToNull && !newAuthority.trim())}
          >
            {processing ? "Processing..." : "Confirm Set Authority"}
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
