import React, { useEffect, useMemo, useState } from "react";
import { FaBan, FaArrowLeft } from "react-icons/fa";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import {
  AuthorityType,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createSetAuthorityInstruction,
  getMint,
} from "@solana/spl-token";

function withTimeout(promise, ms, label = "Request") {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

export default function RevokeMintAuthorityMobile({ onBack }) {
  const { publicKey, sendTransaction, connected } = useWallet();

  // ✅ Use the same connection your app is already providing
  const { connection } = useConnection();

  const REVOKE_MINT_FEE_SOL = 0.04;

  const [searchTerm, setSearchTerm] = useState("");
  const [tokenAccounts, setTokenAccounts] = useState([]); // [{ mint, amount, programId }]
  const [selectedMint, setSelectedMint] = useState("");
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let alive = true;

    async function fetchTokens() {
      if (!publicKey) {
        if (alive) {
          setTokenAccounts([]);
          setLoadingTokens(false);
        }
        return;
      }

      setLoadingTokens(true);
      setStatus("");

      try {
        // ✅ Timeout prevents infinite "Loading..." if RPC hangs on mobile
        const [classic, t22] = await withTimeout(
          Promise.all([
            connection.getParsedTokenAccountsByOwner(publicKey, {
              programId: TOKEN_PROGRAM_ID,
            }),
            connection.getParsedTokenAccountsByOwner(publicKey, {
              programId: TOKEN_2022_PROGRAM_ID,
            }),
          ]),
          12000,
          "Fetching token accounts"
        );

        const parse = (resp, programId) =>
          resp.value
            .map((accountInfo) => accountInfo.account.data.parsed.info)
            .filter((info) => {
              const amt = info?.tokenAmount?.uiAmount ?? 0;
              return amt > 0;
            })
            .map((info) => ({
              mint: info.mint,
              amount: info.tokenAmount.uiAmount,
              programId,
            }));

        const combined = [
          ...parse(classic, TOKEN_PROGRAM_ID),
          ...parse(t22, TOKEN_2022_PROGRAM_ID),
        ];

        // De-dupe by mint (keep higher balance if duplicated)
        const byMint = new Map();
        for (const t of combined) {
          const prev = byMint.get(t.mint);
          if (!prev || (t.amount ?? 0) > (prev.amount ?? 0)) byMint.set(t.mint, t);
        }

        if (alive) setTokenAccounts(Array.from(byMint.values()));
      } catch (err) {
        console.error("Error fetching tokens:", err);
        if (alive) {
          setTokenAccounts([]);
          setStatus(
            `Failed to load tokens.\n${err?.message || "Unknown error"}`
          );
        }
      } finally {
        if (alive) setLoadingTokens(false);
      }
    }

    fetchTokens();

    return () => {
      alive = false;
    };
  }, [publicKey, connection]);

  const selectedToken = useMemo(
    () => tokenAccounts.find((t) => t.mint === selectedMint) || null,
    [tokenAccounts, selectedMint]
  );

  const filteredTokens = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return tokenAccounts;
    return tokenAccounts.filter((t) => t.mint.toLowerCase().includes(q));
  }, [tokenAccounts, searchTerm]);

  const surface = "rounded-2xl border border-[#1CEAB9]/40 overflow-hidden";
  const surfaceInner = "bg-[#0B0E11] w-full h-full";
  const field =
    "w-full rounded-xl bg-black/40 border border-[#1CEAB9]/30 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1CEAB9]/70";
  const button =
    "w-full rounded-xl border border-[#1CEAB9]/60 py-3 text-sm font-semibold text-white hover:border-[#1CEAB9]/90 disabled:opacity-60 disabled:cursor-not-allowed";

  const handleConfirm = async () => {
    if (!selectedMint) return alert("Please select a token mint address.");
    if (!publicKey || !sendTransaction || !connected)
      return alert("Please connect your wallet.");

    try {
      setProcessing(true);
      setStatus("Checking mint authority...");

      const mintPubkey = new PublicKey(selectedMint);

      // Use detected program id if we have it
      const programId = selectedToken?.programId || TOKEN_PROGRAM_ID;

      const mintInfo = await withTimeout(
        getMint(connection, mintPubkey, "confirmed", programId),
        12000,
        "Fetching mint info"
      );

      if (!mintInfo.mintAuthority) {
        setStatus("Mint authority already revoked.");
        return alert("Mint authority is already revoked.");
      }

      if (mintInfo.mintAuthority.toBase58() !== publicKey.toBase58()) {
        setStatus("Connected wallet is not mint authority.");
        return alert("Your connected wallet is NOT the mint authority of this token.");
      }

      setStatus("Building transaction...");

      const ixRevoke = createSetAuthorityInstruction(
        mintPubkey,
        publicKey,
        AuthorityType.MintTokens,
        null,
        [],
        programId
      );

      const treasuryStr = import.meta.env.VITE_ORIGINFI_TREASURY;
      if (!treasuryStr)
        throw new Error("Treasury wallet not configured (VITE_ORIGINFI_TREASURY).");
      const treasuryPubkey = new PublicKey(treasuryStr);

      const feeLamports = Math.round(REVOKE_MINT_FEE_SOL * LAMPORTS_PER_SOL);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: feeLamports,
        }),
        ixRevoke
      );

      setStatus("Requesting wallet approval...");
      const sig = await sendTransaction(tx, connection);

      setStatus("Confirming transaction...");
      await connection.confirmTransaction(sig, "confirmed");

      alert(`Mint authority revoked!\n\nTx:\n${sig}`);
      setStatus(`Success.\nTx: ${sig}`);

      setSelectedMint("");
      setSearchTerm("");
    } catch (err) {
      console.error(err);
      const msg = err?.message || String(err);
      alert("Error revoking mint authority: " + msg);
      setStatus("Failed: " + msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className={surface}>
        <div className={`${surfaceInner} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              disabled={processing}
              className="rounded-xl border border-[#1CEAB9]/35 bg-black/30 px-3 py-2 text-sm hover:border-[#1CEAB9]/60 disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                <FaArrowLeft className="text-[#1CEAB9]" />
                Back
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-[#1CEAB9]/30 bg-black flex items-center justify-center">
                <FaBan className="text-[#1CEAB9] text-xl" />
              </div>
              <div className="text-right">
                <div className="text-lg font-bold leading-tight">
                  Revoke Mint Authority
                </div>
                <div className="text-xs text-white/60">
                  Estimated cost: ~0.04 SOL
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-sm text-white/75">
            Permanently disables future minting by setting mint authority to{" "}
            <span className="text-white font-semibold">null</span>. Only the
            current mint authority can do this.
          </div>
        </div>
      </div>

      {/* Action Card */}
      <div className="mt-4 space-y-4">
        <div className={surface}>
          <div className={`${surfaceInner} p-4 text-white space-y-3`}>
            <div className="text-sm font-semibold">Select Token</div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search mint address..."
              className={field}
              disabled={processing}
            />

            <select
              className={field}
              value={selectedMint}
              onChange={(e) => setSelectedMint(e.target.value)}
              disabled={processing || loadingTokens}
            >
              <option value="" disabled>
                {loadingTokens ? "Loading tokens..." : "Select your token mint address"}
              </option>

              {filteredTokens.length > 0 ? (
                filteredTokens.map((t) => (
                  <option key={t.mint} value={t.mint}>
                    {t.mint} (Bal: {t.amount}){" "}
                    {t.programId === TOKEN_2022_PROGRAM_ID ? "— Token-2022" : ""}
                  </option>
                ))
              ) : (
                !loadingTokens && <option disabled>No matching tokens</option>
              )}
            </select>

            {selectedToken && (
              <div className="rounded-xl border border-[#1CEAB9]/20 bg-black/20 p-3 text-xs text-white/70">
                <div>
                  <span className="text-white/50">Mint:</span>{" "}
                  <span className="text-white break-all">{selectedToken.mint}</span>
                </div>
                <div className="mt-1">
                  <span className="text-white/50">Program:</span>{" "}
                  <span className="text-white">
                    {selectedToken.programId === TOKEN_2022_PROGRAM_ID
                      ? "Token-2022"
                      : "Classic SPL"}
                  </span>
                </div>
              </div>
            )}

            <button
              className={button}
              onClick={handleConfirm}
              disabled={!selectedMint || processing}
            >
              {processing ? "Processing..." : "Confirm Revoke"}
            </button>

            {status && (
              <div className="rounded-xl border border-[#1CEAB9]/20 bg-black/20 p-3 text-xs text-white/70 whitespace-pre-wrap">
                {status}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
