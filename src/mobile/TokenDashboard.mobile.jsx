import React, { useMemo, useState } from "react";
import {
  FaShieldAlt,
  FaChartBar,
  FaBan,
  FaUnlockAlt,
  FaUserShield,
  FaUserCheck,
  FaUserTimes,
  FaTimesCircle,
  FaRegHandshake,
} from "react-icons/fa";

// Reuse existing components (no logic duplication)
import RevokeMintAuthority from "../components/RevokeMintAuthority";
import RevokeFreezeAuthority from "../components/RevokeFreezeAuthority";
import FreezeTokenAccount from "../components/FreezeTokenAccount";
import ThawTokenAccount from "../components/ThawTokenAccount";
import TokenAnalyticsPanel from "../components/TokenAnalyticsPanel";
import SetAuthority from "../components/SetAuthority";
import ApproveDelegate from "../components/ApproveDelegate";
import RevokeDelegate from "../components/RevokeDelegate";
import CloseTokenAccount from "../components/CloseTokenAccount";
import AuthPromoCard from "../components/AuthPromoCard";

export default function TokenDashboardMobile() {
  const [view, setView] = useState("home"); // home | authorities | analytics | promo | detail
  const [activeDetail, setActiveDetail] = useState(null);

  const isAuthed = !!localStorage.getItem("originfi_jwt");

  const authorityOptions = useMemo(
    () => [
      {
        title: "Revoke Mint Authority",
        description: "Remove the ability to mint new tokens for increased security.",
        icon: <FaBan className="text-[#1CEAB9] text-xl" />,
        price: "0.04 SOL",
        key: "RevokeMintAuthority",
      },
      {
        title: "Revoke Freeze Authority",
        description: "Remove the ability to freeze token accounts to prevent misuse.",
        icon: <FaUnlockAlt className="text-[#1CEAB9] text-xl" />,
        price: "0.04 SOL",
        key: "RevokeFreezeAuthority",
      },
      {
        title: "Freeze Token Account",
        description: "Temporarily disable a token account, preventing transfers.",
        icon: <FaShieldAlt className="text-[#1CEAB9] text-xl" />,
        price: "0.02 SOL",
        key: "FreezeTokenAccount",
      },
      {
        title: "Thaw Token Account",
        description: "Re-enable a previously frozen token account.",
        icon: <FaUserShield className="text-[#1CEAB9] text-xl" />,
        price: "0.02 SOL",
        key: "ThawTokenAccount",
      },
      {
        title: "Set Authority",
        description: "Assign or change authority over token operations.",
        icon: <FaRegHandshake className="text-[#1CEAB9] text-xl" />,
        price: "0.02 SOL",
        key: "SetAuthority",
      },
      {
        title: "Approve Delegate",
        description: "Authorize another account to manage tokens on your behalf.",
        icon: <FaUserCheck className="text-[#1CEAB9] text-xl" />,
        price: "0.02 SOL",
        key: "ApproveDelegate",
      },
      {
        title: "Revoke Delegate",
        description: "Remove previously granted delegate permissions.",
        icon: <FaUserTimes className="text-[#1CEAB9] text-xl" />,
        price: "0.02 SOL",
        key: "RevokeDelegate",
      },
      {
        title: "Close Token Account",
        description: "Permanently close a token account and reclaim rent.",
        icon: <FaTimesCircle className="text-[#1CEAB9] text-xl" />,
        price: "0.01 SOL",
        key: "CloseTokenAccount",
      },
    ],
    []
  );

  const goHome = () => {
    setView("home");
    setActiveDetail(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAuthorities = () => {
    setView("authorities");
    setActiveDetail(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAnalytics = () => {
    if (!isAuthed) setView("promo");
    else setView("analytics");
    setActiveDetail(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDetail = (key) => {
    setActiveDetail(key);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backFromDetail = () => {
    setActiveDetail(null);
    setView("authorities");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0E11] overflow-x-hidden">
      {/* pt-20 keeps the fixed Sign In/Profile pill from overlapping */}
      <div className="mx-auto w-full max-w-[560px] px-4 pt-20 pb-24">
        {/* Header */}
        <div className="rounded-2xl border border-[#1CEAB9]/40 bg-white/[0.02] backdrop-blur-md shadow-[0_0_18px_rgba(28,234,185,0.10)] p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-[#1CEAB9]/30 bg-white/[0.02] flex items-center justify-center">
              <FaShieldAlt className="text-[#1CEAB9] text-xl" />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-bold leading-tight">Token Dashboard</div>
              <div className="text-xs text-white/60 leading-snug mt-1">
                Mobile view for authority actions + analytics.
              </div>
            </div>
          </div>
        </div>

        {/* HOME */}
        {view === "home" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-5 text-white">
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-[#1CEAB9] text-lg" />
                <div className="font-semibold">Authority Actions</div>
              </div>
              <div className="mt-2 text-sm text-white/70 leading-snug">
                Revoke authorities, freeze/thaw accounts, set authority, manage delegates.
              </div>

              <button
                className="mt-4 w-full rounded-full border border-[#14b89c] bg-transparent py-3 text-sm font-semibold text-white active:scale-[0.99]"
                onClick={openAuthorities}
              >
                Manage Authorities
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-5 text-white">
              <div className="flex items-center gap-3">
                <FaChartBar className="text-[#1CEAB9] text-lg" />
                <div className="font-semibold">Token Analytics</div>
              </div>
              <div className="mt-2 text-sm text-white/70 leading-snug">
                View analytics and performance data for your created tokens.
              </div>

              <button
                className="mt-4 w-full rounded-full border border-[#14b89c] bg-transparent py-3 text-sm font-semibold text-white active:scale-[0.99]"
                onClick={openAnalytics}
              >
                Select Token to View Analytics
              </button>
            </div>
          </div>
        )}

        {/* AUTHORITIES (dropdown instead of long list) */}
        {view === "authorities" && (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-white font-bold text-lg">Authority Actions</div>
              <button
                className="shrink-0 text-xs font-semibold text-[#1CEAB9] px-3 py-2 rounded-full border border-[#1CEAB9]/40"
                onClick={goHome}
              >
                Back
              </button>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-4 text-white">
              <div className="text-xs text-white/60 mb-2">
                Choose an action (shows one tool at a time).
              </div>

              <select
                className="w-full rounded-xl bg-[#0B0E11] border border-[#1CEAB9]/25 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]/40"
                value={activeDetail || ""}
                onChange={(e) => {
                  const val = e.target.value || null;
                  if (!val) return;
                  openDetail(val);
                }}
              >
                <option value="" disabled>
                  Select an authority action…
                </option>
                {authorityOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.title} — {opt.price}
                  </option>
                ))}
              </select>

              {/* Compact quick picks */}
              <div className="mt-3 grid grid-cols-1 gap-2">
                {authorityOptions.slice(0, 3).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => openDetail(opt.key)}
                    className="w-full text-left rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white active:scale-[0.99]"
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className="font-semibold break-words">{opt.title}</span>
                      <span className="text-[11px] font-semibold text-[#14b89c] whitespace-nowrap">
                        {opt.price}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-white/60 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
                      {opt.description}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-3 text-[11px] text-white/45">
                Tip: When you open an action, this page stays clean and short.
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {view === "analytics" && (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-white font-bold text-lg">Token Analytics</div>
              <button
                className="shrink-0 text-xs font-semibold text-[#1CEAB9] px-3 py-2 rounded-full border border-[#1CEAB9]/40"
                onClick={goHome}
              >
                Back
              </button>
            </div>

            {/* Keep wrapper light so the panel doesn't feel "double boxed" */}
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.015] backdrop-blur-md p-2">
              <TokenAnalyticsPanel />
            </div>
          </div>
        )}

        {/* PROMO */}
        {view === "promo" && (
          <div className="mt-4">
            <AuthPromoCard onBack={goHome} />
          </div>
        )}

        {/* DETAIL (render only the tool; keep outer wrapper minimal) */}
        {view === "detail" && (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-white font-bold text-lg">Action</div>
              <button
                className="shrink-0 text-xs font-semibold text-[#1CEAB9] px-3 py-2 rounded-full border border-[#1CEAB9]/40"
                onClick={backFromDetail}
              >
                Back
              </button>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.015] backdrop-blur-md p-2">
              {activeDetail === "RevokeMintAuthority" && <RevokeMintAuthority onBack={backFromDetail} />}
              {activeDetail === "RevokeFreezeAuthority" && <RevokeFreezeAuthority onBack={backFromDetail} />}
              {activeDetail === "FreezeTokenAccount" && <FreezeTokenAccount onBack={backFromDetail} />}
              {activeDetail === "ThawTokenAccount" && <ThawTokenAccount onBack={backFromDetail} />}
              {activeDetail === "SetAuthority" && <SetAuthority onBack={backFromDetail} />}
              {activeDetail === "ApproveDelegate" && <ApproveDelegate onBack={backFromDetail} />}
              {activeDetail === "RevokeDelegate" && <RevokeDelegate onBack={backFromDetail} />}
              {activeDetail === "CloseTokenAccount" && <CloseTokenAccount onBack={backFromDetail} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
