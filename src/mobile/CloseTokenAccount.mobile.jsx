import React, { useEffect, useMemo, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";
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
  getAccount,
  createCloseAccountInstruction,
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

export default function CloseTokenAccountMobile() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const CLOSE_FEE_SOL = 0.01;

  const [searchTerm, setSearchTerm] = useState("");
  const [tokenAccounts, setTokenAccounts] = useState([]); // [{ tokenAccount, mint, uiAmount, programId }]
  const [selectedTokenAccount, setSelectedTokenAccount] = useState("");
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

        const parse = (resp, programId) =>
          resp.value.map((acc) => {
            const info = acc.account.data.parsed.info;
            return {
              tokenAccount: acc.pubkey.toBase58(),
              mint: info.mint,
              uiAmount: info.tokenAmount.uiAmount,
              programId,
            };
          });

        const combined = [
          ...parse(classic, TOKEN_PROGRAM_ID),
          ...parse(t22, TOKEN_2022_PROGRAM_ID),
        ];

        if (alive) setTokenAccounts(combined);
      } catch (err) {
        console.error(err);
        if (alive) {
          setTokenAccounts([]);
          setStatus(`Failed to load token accounts.\n${err?.message || "Unknown error"}`);
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

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return tokenAccounts;
    return tokenAccounts.filter(
      (t) =>
        t.mint.toLowerCase().includes(q) ||
        t.tokenAccount.toLowerCase().includes(q)
    );
  }, [tokenAccounts, searchTerm]);

  const selected = useMemo(
    () => tokenAccounts.find((t) => t.tokenAccount === selectedTokenAccount) || null,
    [tokenAccounts, selectedTokenAccount]
  );

  const surface = "rounded-2xl border border-[#1CEAB9]/40 overflow-hidden";
  const surfaceInner = "bg-[#0B0E11] w-full h-full";
  const field =
    "w-full rounded-xl bg-black/40 border border-[#1CEAB9]/30 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1CEAB9]/70";
  const button =
    "w-full rounded-xl border border-[#1CEAB9]/60 py-3 text-sm font-semibold text-white hover:border-[#1CEAB9]/90 disabled:opacity-60 disabled:cursor-not-allowed";

  const handleConfirm = async () => {
    if (!publicKey || !sendTransaction || !connected) {
      return alert("Please connect your wallet.");
    }
    if (!selectedTokenAccount) {
      return alert("Please select a token account (ATA).");
    }

    try {
      setProcessing(true);
      setStatus("Validating token account...");

      const tokenAccountPk = new PublicKey(selectedTokenAccount);
      const programId = selected?.programId || TOKEN_PROGRAM_ID;

      // ✅ getAccount needs correct program id
      const acct = await withTimeout(
        getAccount(connection, tokenAccountPk, "confirmed", programId),
        12000,
        "Fetching token account"
      );

      // Safety: closing requires empty balance
      if (acct.amount > 0n) {
        setStatus("Token account balance must be 0 before closing.");
        alert("Token account balance must be 0 before closing.");
        return;
      }

      // Authority rules:
      // - If closeAuthority exists, that signer must sign
      // - Otherwise owner signs
      const closeAuth = acct.closeAuthority;
      const signerMustBe = closeAuth ? closeAuth.toBase58() : acct.owner.toBase58();

      if (signerMustBe !== publicKey.toBase58()) {
        setStatus("Your wallet is not authorized to close this token account.");
        alert("Your wallet is not authorized to close this token account.");
        return;
      }

      setStatus("Building transaction...");

      // Destination for reclaimed rent = your wallet
      const destination = publicKey;

      const ix = createCloseAccountInstruction(
        tokenAccountPk,
        destination,
        publicKey,
        [],
        programId
      );

      const treasuryStr = import.meta.env.VITE_ORIGINFI_TREASURY;
      if (!treasuryStr) {
        throw new Error("Treasury wallet not configured (VITE_ORIGINFI_TREASURY).");
      }
      const treasuryPubkey = new PublicKey(treasuryStr);

      const feeLamports = Math.round(CLOSE_FEE_SOL * LAMPORTS_PER_SOL);

      const tx = new Transaction().add(
        // 1) Pay OriginFi fee FIRST
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: feeLamports,
        }),
        // 2) Close account instruction
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

      alert(`Token account closed!\nRent returned to your wallet.\nTx:\n${sig}`);
      setStatus(`Success.\nTx: ${sig}`);

      setSelectedTokenAccount("");
      setSearchTerm("");
    } catch (err) {
      console.error(err);
      const msg = err?.message || String(err);
      alert("Error closing token account: " + msg);
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
              <FaTimesCircle className="text-[#1CEAB9] text-2xl" />
            </div>

            <div>
              <div className="text-lg font-bold">Close Token Account</div>
              <div className="text-xs text-white/60 mt-0.5">
                Estimated cost: ~0.01 SOL
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-white/75 text-center">
            Closes a token account (ATA) and returns the rent SOL back to your wallet.
            The token account balance must be <b>0</b>.
          </div>
        </div>
      </div>

      {/* Action Card */}
      <div className="mt-4 space-y-4">
        <div className={surface}>
          <div className={`${surfaceInner} p-4 text-white space-y-3`}>
            <div className="text-sm font-semibold">Select Account & Confirm</div>

            <input
              type="text"
              placeholder="Search mint or token account..."
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
                {loadingTokens ? "Loading token accounts..." : "Select token account (ATA)"}
              </option>

              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <option key={t.tokenAccount} value={t.tokenAccount}>
                    {t.tokenAccount} (Mint: {t.mint.slice(0, 6)}... Bal: {t.uiAmount ?? 0})
                    {t.programId === TOKEN_2022_PROGRAM_ID ? " — Token-2022" : ""}
                  </option>
                ))
              ) : (
                !loadingTokens && <option disabled>No matching token accounts</option>
              )}
            </select>

            {selected && (
              <div className="rounded-xl border border-[#1CEAB9]/20 bg-black/20 p-3 text-xs text-white/70">
                <div>
                  <span className="text-white/50">Token Account:</span>{" "}
                  <span className="text-white break-all">{selected.tokenAccount}</span>
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
              onClick={handleConfirm}
              disabled={!selectedTokenAccount || processing}
            >
              {processing ? "Processing..." : "Confirm Close"}
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
