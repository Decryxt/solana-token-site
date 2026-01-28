import React, { useEffect, useMemo, useState } from "react";
import { FaShieldAlt } from "react-icons/fa";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createThawAccountInstruction,
  getAccount,
  getMint,
} from "@solana/spl-token";

function withTimeout(promise, ms, label = "Request") {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

export default function ThawTokenAccountMobile() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const THAW_FEE_SOL = 0.02;

  const [searchTerm, setSearchTerm] = useState("");
  const [tokenAccounts, setTokenAccounts] = useState([]); // [{ pubkey, mint, amount, state, programId }]
  const [selectedTokenAccount, setSelectedTokenAccount] = useState("");
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let alive = true;

    async function fetchFrozenTokenAccounts() {
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
        // ✅ Pull token accounts for BOTH programs (classic + Token-2022)
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

        const parseFrozen = (resp, programId) =>
          resp.value
            .map((acc) => {
              const info = acc.account.data.parsed.info;
              const amt = info?.tokenAmount?.uiAmount ?? 0;
              const state = info?.state; // "initialized" | "frozen" (parsed)
              return {
                pubkey: acc.pubkey.toBase58(),
                mint: info.mint,
                amount: amt,
                state,
                programId,
              };
            })
            .filter((t) => (t.amount ?? 0) > 0 && t.state === "frozen");

        const frozen = [
          ...parseFrozen(classic, TOKEN_PROGRAM_ID),
          ...parseFrozen(t22, TOKEN_2022_PROGRAM_ID),
        ];

        if (alive) setTokenAccounts(frozen);
      } catch (err) {
        console.error("Error fetching frozen token accounts:", err);
        if (alive) {
          setTokenAccounts([]);
          setStatus(
            `Failed to load frozen accounts.\n${err?.message || "Unknown error"}`
          );
        }
      } finally {
        if (alive) setLoadingTokens(false);
      }
    }

    fetchFrozenTokenAccounts();

    return () => {
      alive = false;
    };
  }, [publicKey, connection]);

  const filteredTokenAccounts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return tokenAccounts;
    return tokenAccounts.filter((t) => t.mint.toLowerCase().includes(q));
  }, [tokenAccounts, searchTerm]);

  const selected = useMemo(
    () => tokenAccounts.find((t) => t.pubkey === selectedTokenAccount) || null,
    [tokenAccounts, selectedTokenAccount]
  );

  const surface = "rounded-2xl border border-[#1CEAB9]/40 overflow-hidden";
  const surfaceInner = "bg-[#0B0E11] w-full h-full";
  const field =
    "w-full rounded-xl bg-black/40 border border-[#1CEAB9]/30 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1CEAB9]/70";
  const button =
    "w-full rounded-xl border border-[#1CEAB9]/60 py-3 text-sm font-semibold text-white hover:border-[#1CEAB9]/90 disabled:opacity-60 disabled:cursor-not-allowed";

  const handleThaw = async () => {
    if (!selectedTokenAccount) return alert("Please select a frozen token account to thaw.");
    if (!publicKey || !sendTransaction || !connected) return alert("Please connect your wallet.");

    try {
      setProcessing(true);
      setStatus("Loading token account...");

      const tokenAccountPubkey = new PublicKey(selectedTokenAccount);
      const programId = selected?.programId || TOKEN_PROGRAM_ID;

      // ✅ getAccount needs the correct token program
      const tokenAccountInfo = await withTimeout(
        getAccount(connection, tokenAccountPubkey, "confirmed", programId),
        12000,
        "Fetching token account"
      );

      const mintPubkey = tokenAccountInfo.mint;

      setStatus("Checking freeze authority...");

      // ✅ getMint needs correct program; gives reliable freezeAuthority (classic + 2022)
      const mintInfo = await withTimeout(
        getMint(connection, mintPubkey, "confirmed", programId),
        12000,
        "Fetching mint info"
      );

      if (!mintInfo.freezeAuthority) {
        setStatus("Freeze authority not set / already revoked.");
        return alert("This token's freeze authority is revoked or not set.");
      }

      if (mintInfo.freezeAuthority.toBase58() !== publicKey.toBase58()) {
        setStatus("Connected wallet is not freeze authority.");
        return alert("Your wallet is NOT the freeze authority of this token mint.");
      }

      setStatus("Building transaction...");

      const ix = createThawAccountInstruction(
        tokenAccountPubkey,
        mintPubkey,
        publicKey,
        [],
        programId
      );

      const treasuryStr = import.meta.env.VITE_ORIGINFI_TREASURY;
      if (!treasuryStr) {
        throw new Error("Treasury wallet not configured (VITE_ORIGINFI_TREASURY).");
      }
      const treasuryPubkey = new PublicKey(treasuryStr);

      const feeLamports = Math.round(THAW_FEE_SOL * LAMPORTS_PER_SOL);

      const tx = new Transaction().add(
        // 1) Pay OriginFi fee FIRST
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: feeLamports,
        }),
        // 2) Thaw instruction
        ix
      );

      setStatus("Requesting wallet approval...");
      const sig = await withTimeout(
        sendTransaction(tx, connection),
        15000,
        "sendTransaction"
      );

      setStatus("Confirming transaction...");
      await connection.confirmTransaction(sig, "confirmed");

      alert(`Token account thawed!\n\nTx:\n${sig}`);
      setStatus(`Success.\nTx: ${sig}`);

      setSelectedTokenAccount("");
      setSearchTerm("");
    } catch (err) {
      console.error(err);
      const msg = err?.message || String(err);
      alert("Error thawing token account: " + msg);
      setStatus("Failed: " + msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header (Centered) */}
      <div className={surface}>
        <div className={`${surfaceInner} p-5 text-white`}>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-xl border border-[#1CEAB9]/30 bg-black flex items-center justify-center">
              <FaShieldAlt className="text-[#1CEAB9] text-2xl" />
            </div>

            <div>
              <div className="text-lg font-bold">Thaw Token Account</div>
              <div className="text-xs text-white/60 mt-0.5">
                Estimated cost: ~0.02 SOL
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-white/75 text-center">
            Thawing a frozen token account re-enables transfers for that account.
            Only the freeze authority of the token mint can perform this action.
          </div>
        </div>
      </div>

      {/* Action Card */}
      <div className="mt-4 space-y-4">
        <div className={surface}>
          <div className={`${surfaceInner} p-4 text-white space-y-3`}>
            <div className="text-sm font-semibold">Select Frozen Account</div>

            <input
              type="text"
              placeholder="Search token mint address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={field}
              disabled={processing}
            />

            <select
              className={field}
              value={selectedTokenAccount}
              onChange={(e) => setSelectedTokenAccount(e.target.value)}
              disabled={processing || loadingTokens}
            >
              <option disabled value="">
                {loadingTokens
                  ? "Loading frozen accounts..."
                  : tokenAccounts.length === 0
                  ? "No frozen tokens found"
                  : "Select a frozen account"}
              </option>

              {filteredTokenAccounts.length > 0 &&
                filteredTokenAccounts.map((t) => (
                  <option key={t.pubkey} value={t.pubkey}>
                    {t.mint} — Bal: {t.amount}{" "}
                    {t.programId === TOKEN_2022_PROGRAM_ID ? "— Token-2022" : ""}
                  </option>
                ))}
            </select>

            {selected && (
              <div className="rounded-xl border border-[#1CEAB9]/20 bg-black/20 p-3 text-xs text-white/70">
                <div>
                  <span className="text-white/50">Token Account:</span>{" "}
                  <span className="text-white break-all">{selected.pubkey}</span>
                </div>
                <div className="mt-1">
                  <span className="text-white/50">Mint:</span>{" "}
                  <span className="text-white break-all">{selected.mint}</span>
                </div>
                <div className="mt-1">
                  <span className="text-white/50">Program:</span>{" "}
                  <span className="text-white">
                    {selected.programId === TOKEN_2022_PROGRAM_ID ? "Token-2022" : "Classic SPL"}
                  </span>
                </div>
              </div>
            )}

            <button
              className={button}
              onClick={handleThaw}
              disabled={!selectedTokenAccount || processing}
            >
              {processing ? "Processing..." : "Thaw Account"}
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
