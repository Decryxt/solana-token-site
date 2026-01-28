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

// Reuse your existing detail/inner components (no duplication of logic)
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
        icon: <FaBan className="text-[#1CEAB9] text-2xl" />,
        price: "0.04 SOL",
        key: "RevokeMintAuthority",
      },
      {
        title: "Revoke Freeze Authority",
        description: "Remove the ability to freeze token accounts to prevent misuse.",
        icon: <FaUnlockAlt className="text-[#1CEAB9] text-2xl" />,
        price: "0.04 SOL",
        key: "RevokeFreezeAuthority",
      },
      {
        title: "Freeze Token Account",
        description: "Temporarily disable a token account, preventing transfers.",
        icon: <FaShieldAlt className="text-[#1CEAB9] text-2xl" />,
        price: "0.02 SOL",
        key: "FreezeTokenAccount",
      },
      {
        title: "Thaw Token Account",
        description: "Re-enable a previously frozen token account.",
        icon: <FaUserShield className="text-[#1CEAB9] text-2xl" />,
        price: "0.02 SOL",
        key: "ThawTokenAccount",
      },
      {
        title: "Set Authority",
        description: "Assign or change authority over token operations.",
        icon: <FaRegHandshake className="text-[#1CEAB9] text-2xl" />,
        price: "0.02 SOL",
        key: "SetAuthority",
      },
      {
        title: "Approve Delegate",
        description: "Authorize another account to manage tokens on your behalf.",
        icon: <FaUserCheck className="text-[#1CEAB9] text-2xl" />,
        price: "0.02 SOL",
        key: "ApproveDelegate",
      },
      {
        title: "Revoke Delegate",
        description: "Remove previously granted delegate permissions.",
        icon: <FaUserTimes className="text-[#1CEAB9] text-2xl" />,
        price: "0.02 SOL",
        key: "RevokeDelegate",
      },
      {
        title: "Close Token Account",
        description: "Permanently close a token account and reclaim rent.",
        icon: <FaTimesCircle className="text-[#1CEAB9] text-2xl" />,
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
    if (!isAuthed) {
      setView("promo");
    } else {
      setView("analytics");
    }
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
      <div className="mx-auto w-full max-w-[560px] px-4 pt-4 pb-24">
        {/* Header */}
        <div className="rounded-2xl border border-[#1CEAB9]/60 bg-black/30 shadow-lg p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-[#1CEAB9]/40 bg-[#0B0E11] flex items-center justify-center">
              <FaShieldAlt className="text-[#1CEAB9] text-xl" />
            </div>
            <div>
              <div className="text-xl font-bold leading-tight">Token Dashboard</div>
              <div className="text-xs text-white/60 leading-snug mt-1">
                Mobile view. Manage authorities and view analytics.
              </div>
            </div>
          </div>
        </div>

        {/* HOME */}
        {view === "home" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-white">
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-[#1CEAB9] text-lg" />
                <div className="font-semibold">Authority Actions</div>
              </div>
              <div className="mt-2 text-sm text-white/70 leading-snug">
                Revoke mint/freeze authorities, freeze/thaw accounts, set authority, manage delegates.
              </div>
              <button
                className="mt-4 w-full rounded-full border-2 border-[#14b89c] bg-[#0B0E11] py-3 text-sm font-semibold text-white active:scale-[0.99]"
                onClick={openAuthorities}
              >
                Manage Authorities
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-white">
              <div className="flex items-center gap-3">
                <FaChartBar className="text-[#1CEAB9] text-lg" />
                <div className="font-semibold">Token Analytics</div>
              </div>
              <div className="mt-2 text-sm text-white/70 leading-snug">
                View analytics and performance data for your created tokens.
              </div>
              <button
                className="mt-4 w-full rounded-full border-2 border-[#14b89c] bg-[#0B0E11] py-3 text-sm font-semibold text-white active:scale-[0.99]"
                onClick={openAnalytics}
              >
                Select Token to View Analytics
              </button>
            </div>
          </div>
        )}

        {/* AUTHORITIES GRID */}
        {view === "authorities" && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-white font-bold text-lg">Authority Actions</div>
              <button
                className="text-xs font-semibold text-[#1CEAB9] px-3 py-2 rounded-full border border-[#1CEAB9]/40"
                onClick={goHome}
              >
                Back
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {authorityOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => openDetail(opt.key)}
                  className="text-left rounded-2xl border border-[#1CEAB9]/35 bg-[#121619] p-4 text-white hover:bg-[#121c20] active:scale-[0.99] transition"
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="mt-1">{opt.icon}</div>
                      <div>
                        <div className="font-semibold leading-snug">{opt.title}</div>
                        <div className="mt-1 text-xs text-white/60 leading-snug">
                          {opt.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-[#14b89c] whitespace-nowrap">
                      {opt.price}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {view === "analytics" && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-white font-bold text-lg">Token Analytics</div>
              <button
                className="text-xs font-semibold text-[#1CEAB9] px-3 py-2 rounded-full border border-[#1CEAB9]/40"
                onClick={goHome}
              >
                Back
              </button>
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
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

        {/* DETAIL */}
        {view === "detail" && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-white font-bold text-lg">Action</div>
              <button
                className="text-xs font-semibold text-[#1CEAB9] px-3 py-2 rounded-full border border-[#1CEAB9]/40"
                onClick={backFromDetail}
              >
                Back
              </button>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
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
              {activeDetail === "SetAuthority" && (
                <SetAuthority onBack={backFromDetail} />
              )}
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
