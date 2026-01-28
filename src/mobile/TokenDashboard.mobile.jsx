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

import RevokeMintAuthorityMobile from "./RevokeMintAuthority.mobile";
import RevokeFreezeAuthorityMobile from "./RevokeFreezeAuthority.mobile";
import FreezeTokenAccountMobile from "./FreezeTokenAccount.mobile";
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

  // clean border + guaranteed contained black fill
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
      <div className="mx-auto w-full max-w-[560px] px-4 pt-24 pb-24">
        {/* HEADER */}
        <div className={surface}>
          <div className={`${surfaceInner} p-5 text-white`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-[#1CEAB9]/30 bg-black flex items-center justify-center">
                <FaShieldAlt className="text-[#1CEAB9] text-xl" />
              </div>
              <div>
                <div className="text-xl font-bold">Token Dashboard</div>
                <div className="text-xs text-white/60 mt-1">
                  Mobile authority actions + analytics
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
                <p className="text-sm text-white/70 mt-2">
                  Revoke authorities, freeze/thaw accounts, set authority, manage delegates.
                </p>
                <button
                  onClick={openAuthorities}
                  className="mt-4 w-full rounded-full border border-[#1CEAB9]/50 py-3 text-sm font-semibold"
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
                <p className="text-sm text-white/70 mt-2">
                  View analytics and performance data for your tokens.
                </p>
                <button
                  onClick={openAnalytics}
                  className="mt-4 w-full rounded-full border border-[#1CEAB9]/50 py-3 text-sm font-semibold"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AUTHORITIES — DROPDOWN ONLY */}
        {view === "authorities" && (
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <div className="font-bold text-white">Authority Actions</div>
              <button onClick={goHome} className="text-xs text-[#1CEAB9]">
                Back
              </button>
            </div>

            <div className={surface}>
              <div className={`${surfaceInner} p-4`}>
                <select
                  className="w-full rounded-xl bg-black border border-[#1CEAB9]/40 px-3 py-3 text-sm text-white"
                  value={activeDetail || ""}
                  onChange={(e) => openDetail(e.target.value)}
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
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {view === "analytics" && (
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <div className="font-bold text-white">Token Analytics</div>
              <button onClick={goHome} className="text-xs text-[#1CEAB9]">
                Back
              </button>
            </div>

            <div className={surface}>
              <div className={`${surfaceInner} p-3`}>
                <TokenAnalyticsPanel />
              </div>
            </div>
          </div>
        )}

        {/* PROMO */}
        {view === "promo" && <AuthPromoCard onBack={goHome} />}

        {/* DETAIL */}
        {view === "detail" && (
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <div className="font-bold text-white">Action</div>
              <button onClick={backFromDetail} className="text-xs text-[#1CEAB9]">
                Back
              </button>
            </div>

            <div>
              {activeDetail === "RevokeMintAuthority" && (
                <RevokeMintAuthorityMobile onBack={backFromDetail} />
              )}
              {activeDetail === "RevokeFreezeAuthority" && (
                <RevokeFreezeAuthorityMobile onBack={backFromDetail} />
              )}
              {activeDetail === "FreezeTokenAccount" && (
                <FreezeTokenAccountMobile onBack={backFromDetail} />
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
