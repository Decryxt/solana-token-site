import React, { useEffect, useMemo, useState } from "react";
import { FaRegHandshake } from "react-icons/fa";
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
  getMint,
  getAccount,
  createSetAuthorityInstruction,
  AuthorityType,
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

export default function SetAuthorityMobile() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  // same fee as desktop reference
  const SET_AUTH_FEE_SOL = 0.02;

  const [searchTerm, setSearchTerm] = useState("");
  const [tokenAccounts, setTokenAccounts] = useState([]); // [{ tokenAccount, mint, amount, programId }]
  const [loadingTokens, setLoadingTokens] = useState(false);

  const [authorityType, setAuthorityType] = useState("MintTokens"); // MintTokens | FreezeAccount | AccountOwner | CloseAccount
  const [selectedTarget, setSelectedTarget] = useState(""); // mint for mint/freeze, tokenAccount for owner/close
  const [newAuthority, setNewAuthority] = useState(""); // address, or blank if revoking
  const [revokeToNull, setRevokeToNull] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");

  const isMintAuthorityType =
    authorityType === "MintTokens" || authorityType === "FreezeAccount";

  // Fetch token accounts owned by wallet (needed for AccountOwner/CloseAccount types)
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
        // ✅ Fetch both classic SPL + Token-2022 accounts
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
              amount: info.tokenAmount.uiAmount,
              programId,
            };
          });

        const combined = [
          ...parse(classic, TOKEN_PROGRAM_ID),
          ...parse(t22, TOKEN_2022_PROGRAM_ID),
        ];

        if (alive) setTokenAccounts(combined);
      } catch (e) {
        console.error("Error fetching token accounts:", e);
        if (alive) {
          setTokenAccounts([]);
          setStatus(`Failed to load tokens.\n${e?.message || "Unknown error"}`);
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

  const filteredTargets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return tokenAccounts;

    return tokenAccounts.filter(
      (t) =>
        t.mint.toLowerCase().includes(q) ||
        t.tokenAccount.toLowerCase().includes(q)
    );
  }, [tokenAccounts, searchTerm]);

  const selectedToken = useMemo(() => {
    if (!selectedTarget) return null;

    if (isMintAuthorityType) {
      // selectedTarget is a mint
      return tokenAccounts.find((t) => t.mint === selectedTarget) || null;
    }
    // selectedTarget is a token account
    return tokenAccounts.find((t) => t.tokenAccount === selectedTarget) || null;
  }, [selectedTarget, tokenAccounts, isMintAuthorityType]);

  const resetFields = () => {
    setSelectedTarget("");
    setSearchTerm("");
    setNewAuthority("");
    setRevokeToNull(false);
    setStatus("");
  };

  const handleConfirm = async () => {
    if (!publicKey || !sendTransaction || !connected) {
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
      setStatus("Preparing...");

      let ix;
      let programId = selectedToken?.programId || TOKEN_PROGRAM_ID;

      if (isMintAuthorityType) {
        // Target is a mint
        const mintPubkey = new PublicKey(selectedTarget);

        const mintInfo = await withTimeout(
          getMint(connection, mintPubkey, "confirmed", programId),
          12000,
          "Fetching mint info"
        );

        const currentAuth =
          authorityType === "MintTokens"
            ? mintInfo.mintAuthority
            : mintInfo.freezeAuthority;

        if (!currentAuth) {
          alert("That authority is already revoked on this mint.");
          setStatus("Authority already revoked on this mint.");
          return;
        }

        if (currentAuth.toBase58() !== publicKey.toBase58()) {
          alert("Your connected wallet does NOT control this authority.");
          setStatus("Connected wallet is not the current authority.");
          return;
        }

        ix = createSetAuthorityInstruction(
          mintPubkey,
          publicKey,
          AuthorityType[authorityType],
          revokeToNull ? null : new PublicKey(newAuthority.trim()),
          [],
          programId
        );
      } else {
        // Target is a token account (ATA)
        const tokenAccountPubkey = new PublicKey(selectedTarget);

        const acct = await withTimeout(
          getAccount(connection, tokenAccountPubkey, "confirmed", programId),
          12000,
          "Fetching token account"
        );

        if (authorityType === "CloseAccount") {
          const closeAuth = acct.closeAuthority;
          if (closeAuth && closeAuth.toBase58() !== publicKey.toBase58()) {
            alert("Your wallet is NOT the close authority for this token account.");
            setStatus("Connected wallet is not close authority.");
            return;
          }
          if (!closeAuth && acct.owner.toBase58() !== publicKey.toBase58()) {
            alert("Your wallet is NOT the owner of this token account.");
            setStatus("Connected wallet is not token owner.");
            return;
          }
        } else if (authorityType === "AccountOwner") {
          if (acct.owner.toBase58() !== publicKey.toBase58()) {
            alert("Your wallet is NOT the owner of this token account.");
            setStatus("Connected wallet is not token owner.");
            return;
          }
          if (revokeToNull) {
            alert("You cannot revoke AccountOwner to null. You must set a new owner.");
            setStatus("AccountOwner cannot be revoked to null.");
            return;
          }
        }

        ix = createSetAuthorityInstruction(
          tokenAccountPubkey,
          publicKey,
          AuthorityType[authorityType],
          revokeToNull ? null : new PublicKey(newAuthority.trim()),
          [],
          programId
        );
      }

      const treasuryStr = import.meta.env.VITE_ORIGINFI_TREASURY;
      if (!treasuryStr) {
        throw new Error("Treasury wallet not configured (VITE_ORIGINFI_TREASURY).");
      }
      const treasuryPubkey = new PublicKey(treasuryStr);

      const feeLamports = Math.round(SET_AUTH_FEE_SOL * LAMPORTS_PER_SOL);

      const tx = new Transaction().add(
        // 1) Pay OriginFi fee FIRST
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: feeLamports,
        }),
        // 2) Set authority instruction
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

      alert(`Authority updated!\n\nTx:\n${sig}`);
      setStatus(`Success.\nTx: ${sig}`);
      resetFields();
    } catch (err) {
      console.error(err);
      alert("Error setting authority: " + (err?.message || err));
      setStatus("Failed: " + (err?.message || err));
    } finally {
      setProcessing(false);
    }
  };

  // UI classes (match your mobile theme)
  const surface = "rounded-2xl border border-[#1CEAB9]/40 overflow-hidden";
  const surfaceInner = "bg-[#0B0E11] w-full h-full";
  const field =
    "w-full rounded-xl bg-black/40 border border-[#1CEAB9]/30 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1CEAB9]/70";
  const button =
    "w-full rounded-xl border border-[#1CEAB9]/60 py-3 text-sm font-semibold text-white hover:border-[#1CEAB9]/90 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="w-full">
      {/* Header (Centered) */}
      <div className={surface}>
        <div className={`${surfaceInner} p-5 text-white`}>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-xl border border-[#1CEAB9]/30 bg-black flex items-center justify-center">
              <FaRegHandshake className="text-[#1CEAB9] text-2xl" />
            </div>

            <div>
              <div className="text-lg font-bold">Set Authority</div>
              <div className="text-xs text-white/60 mt-0.5">
                Estimated cost: ~0.02 SOL
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-white/75 text-center">
            Set or change SPL authorities. Mint/Freeze applies to the <b>Mint</b>.
            Owner/Close applies to a <b>Token Account (ATA)</b>.
          </div>
        </div>
      </div>

      {/* Action Card */}
      <div className="mt-4 space-y-4">
        <div className={surface}>
          <div className={`${surfaceInner} p-4 text-white space-y-3`}>
            <div className="text-sm font-semibold">Authority Settings</div>

            {/* Authority Type */}
            <select
              className={field}
              value={authorityType}
              onChange={(e) => {
                setAuthorityType(e.target.value);
                resetFields();
              }}
              disabled={processing}
            >
              <option value="MintTokens">Mint Authority (MintTokens)</option>
              <option value="FreezeAccount">Freeze Authority (FreezeAccount)</option>
              <option value="AccountOwner">Token Account Owner (AccountOwner)</option>
              <option value="CloseAccount">Token Account Close Authority (CloseAccount)</option>
            </select>

            {/* Revoke toggle */}
            <label className="flex items-center gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={revokeToNull}
                onChange={(e) => setRevokeToNull(e.target.checked)}
                disabled={processing || authorityType === "AccountOwner"}
              />
              <span>
                Revoke authority (set to <b>null</b>)
                {authorityType === "AccountOwner" && (
                  <span className="text-xs text-white/50 ml-2">
                    (not allowed)
                  </span>
                )}
              </span>
            </label>

            {/* Search */}
            <input
              type="text"
              placeholder={
                isMintAuthorityType
                  ? "Search mint address..."
                  : "Search mint or token account..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={field}
              disabled={processing}
            />

            {/* Target Select */}
            <select
              className={field}
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              disabled={processing || loadingTokens}
            >
              <option disabled value="">
                {loadingTokens
                  ? "Loading..."
                  : isMintAuthorityType
                  ? "Select mint (from your wallet tokens)"
                  : "Select token account (ATA)"}
              </option>

              {filteredTargets.length > 0 ? (
                filteredTargets.map((t) => (
                  <option
                    key={t.tokenAccount}
                    value={isMintAuthorityType ? t.mint : t.tokenAccount}
                  >
                    {isMintAuthorityType
                      ? `${t.mint} (Bal: ${t.amount ?? 0}) ${
                          t.programId === TOKEN_2022_PROGRAM_ID ? "— Token-2022" : ""
                        }`
                      : `${t.tokenAccount} (Mint: ${t.mint.slice(
                          0,
                          6
                        )}..., Bal: ${t.amount ?? 0}) ${
                          t.programId === TOKEN_2022_PROGRAM_ID ? "— Token-2022" : ""
                        }`}
                  </option>
                ))
              ) : (
                !loadingTokens && <option disabled>No matching tokens</option>
              )}
            </select>

            {/* New Authority */}
            <input
              type="text"
              placeholder={
                revokeToNull
                  ? "Revoking to null (no address needed)"
                  : "New authority wallet address"
              }
              value={newAuthority}
              onChange={(e) => setNewAuthority(e.target.value)}
              className={field}
              disabled={processing || revokeToNull}
            />

            <button
              className={button}
              onClick={handleConfirm}
              disabled={
                !selectedTarget ||
                processing ||
                (!revokeToNull && !newAuthority.trim())
              }
            >
              {processing ? "Processing..." : "Confirm Set Authority"}
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
