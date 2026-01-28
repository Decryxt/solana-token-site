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

  // Outer outline stays clean; black fill cannot escape because overflow-hidden clips it
  const surface = "rounded-2xl border border-[#1CEAB9]/40 overflow-hidden";
  const surfaceInner = "bg-[#0B0E11] w-full h-full";

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
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      {/* pt-24 keeps fixed Sign In/Profile from overlapping */}
      <div className="mx-auto w-full max-w-[560px] px-4 pt-24 pb-24">
        {/* Header */}
        <div className={surface}>
          <div className={`${surfaceInner} p-5 text-white`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-[#1CEAB9]/30 bg-black flex items-center justify-center">
                <FaShieldAlt className="text-[#1CEAB9] text-xl" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold leading-tight">Token Dashboard</div>
                <div className="text-xs text-white/60 leading-snug mt-1">
                  Mobile authority actions + analytics.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HOME */}
        {view === "home" && (
          <div className="mt-4 space-y-4">
            <div className={surface}>
              <div className={`${surfaceInner} p-5 text-white`}>
                <div className="flex items-center gap-3">
                  <FaShieldAlt className="text-[#1CEAB9]" />
                  <div className="font-semibold">Authority Actions</div>
                </div>
                <div className="mt-2 text-sm text-white/70 leading-snug">
                  Revoke authorities, freeze/thaw accounts, set authority, manage delegates.
                </div>
                <button
                  className="mt-4 w-full rounded-full border border-[#1CEAB9]/50 bg-transparent py-3 text-sm font-semibold text-white active:scale-[0.99]"
                  onClick={openAuthorities}
                >
                  Manage Authorities
                </button>
              </div>
            </div>

            <div className={surface}>
              <div className={`${surfaceInner} p-5 text-white`}>
                <div className="flex items-center gap-3">
                  <FaChartBar className="text-[#1CEAB9]" />
                  <div className="font-semibold">Token Analytics</div>
                </div>
                <div className="mt-2 text-sm text-white/70 leading-snug">
                  View analytics and performance data for your created tokens.
                </div>
                <button
                  className="mt-4 w-full rounded-full border border-[#1CEAB9]/50 bg-transparent py-3 text-sm font-semibold text-white active:scale-[0.99]"
                  onClick={openAnalytics}
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AUTHORITIES (dropdown to keep it short) */}
        {view === "authorities" && (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-white font-bold text-lg">Authority Actions</div>
              <button
                className="shrink-0 text-xs font-semibold text-[#1CEAB9]"
                onClick={goHome}
              >
                Back
              </button>
            </div>

            <div className={`${surface} mt-3`}>
              <div className={`${surfaceInner} p-4 text-white`}>
                <div className="text-xs text-white/60 mb-2">
                  Choose an action (shows one tool at a time).
                </div>

                <select
                  className="w-full rounded-xl bg-black border border-[#1CEAB9]/40 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]/40"
                  value={activeDetail || ""}
                  onChange={(e) => {
                    const val = e.target.value;
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

                {/* Optional: show compact preview list (still short) */}
                <div className="mt-3 space-y-2">
                  {authorityOptions.slice(0, 3).map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => openDetail(opt.key)}
                      className="w-full text-left rounded-xl border border-white/10 bg-black/40 px-3 py-3 active:scale-[0.99]"
                      type="button"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">{opt.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-semibold text-sm break-words">
                              {opt.title}
                            </div>
                            <div className="shrink-0 text-[11px] font-semibold text-[#1CEAB9] whitespace-nowrap">
                              {opt.price}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-white/60 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
                            {opt.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
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
                className="shrink-0 text-xs font-semibold text-[#1CEAB9]"
                onClick={goHome}
              >
                Back
              </button>
            </div>

            <div className={`${surface} mt-3`}>
              <div className={`${surfaceInner} p-3`}>
                <TokenAnalyticsPanel />
              </div>
            </div>
          </div>
        )}

        {/* PROMO */}
        {view === "promo" && (
          <div className="mt-4">
            <AuthPromoCard onBack={goHome} />
          </div>
        )}

        {/* DETAIL */}
        {view === "detail" && (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-white font-bold text-lg">Action</div>
              <button
                className="shrink-0 text-xs font-semibold text-[#1CEAB9]"
                onClick={backFromDetail}
              >
                Back
              </button>
            </div>

            {/* IMPORTANT: no extra heavy wrapper here (prevents double-box look) */}
            <div className="mt-3">
              {activeDetail === "RevokeMintAuthority" && (
                <RevokeMintAuthority onBack={backFromDetail} />
              )}
              {activeDetail === "RevokeFreezeAuthority" && (
                <RevokeFreezeAuthority onBack={backFromDetail} />
              )}
              {activeDetail === "FreezeTokenAccount" && (
                <FreezeTokenAccount onBack={backFromDetail} />
              )}
              {activeDetail === "ThawTokenAccount" && (
                <ThawTokenAccount onBack={backFromDetail} />
              )}
              {activeDetail === "SetAuthority" && <SetAuthority onBack={backFromDetail} />}
              {activeDetail === "ApproveDelegate" && (
                <ApproveDelegate onBack={backFromDetail} />
              )}
              {activeDetail === "RevokeDelegate" && (
                <RevokeDelegate onBack={backFromDetail} />
              )}
              {activeDetail === "CloseTokenAccount" && (
                <CloseTokenAccount onBack={backFromDetail} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
