import React from "react";
import {
  FaArrowLeft,
  FaBolt,
  FaChartLine,
  FaShieldAlt,
  FaHistory,
  FaCheckCircle,
  FaCoins,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function AuthPromoCard({
  onBack = () => {},
  title = "Unlock Creator Features",
  subtitle = "Sign in to access analytics, saved history, and gated creator tools tied to your account.",
}) {
  const perks = [
    {
      icon: <FaChartLine className="text-[#1CEAB9] text-base" />,
      title: "Token analytics",
      desc: "View performance data for tokens you create.",
    },
    {
      icon: <FaHistory className="text-[#7CF7D4] text-base" />,
      title: "Saved history",
      desc: "Everything stays organized under your profile.",
    },
    {
      icon: <FaShieldAlt className="text-[#1CEAB9] text-base" />,
      title: "Account-based access",
      desc: "Helps limit random browsing and scraping.",
    },
    {
      icon: <FaBolt className="text-[#FFD37A] text-base" />,
      title: "Faster workflow",
      desc: "Less re-entry when using tools repeatedly.",
    },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-xl overflow-hidden">
        {/* Header (compact) */}
        <div className="relative px-5 pt-4 pb-3 border-b border-[#1CEAB9]/20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#1CEAB9]/10 blur-3xl" />
          </div>

          <button
            type="button"
            onClick={onBack}
            className="relative z-10 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <FaArrowLeft />
            Back
          </button>

          <div className="relative z-10 mt-3 flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-xl border border-[#1CEAB9]/40 bg-[#101418] flex items-center justify-center">
              <FaCoins className="text-[#1CEAB9] text-xl" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white leading-tight">
                {title}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-white/70 leading-snug">
                {subtitle}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 text-[11px] text-white/80 border border-white/10 bg-white/5 px-2 py-1 rounded-full">
                  <FaCheckCircle className="text-[#1CEAB9]" />
                  100% free account
                </span>
                <span className="inline-flex items-center gap-2 text-[11px] text-white/80 border border-white/10 bg-white/5 px-2 py-1 rounded-full">
                  <FaExternalLinkAlt className="text-[#1CEAB9]" />
                  Use Account (top-right)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body (compact, no extra sections) */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {perks.map((p, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#1CEAB9]/15 bg-[#101418] px-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center">
                    {p.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-semibold text-sm leading-tight">
                      {p.title}
                    </div>
                    <div className="mt-0.5 text-[12px] text-white/65 leading-snug">
                      {p.desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center text-[11px] text-white/50">
            Creating an account is free — no cost, no commitment.
          </div>
        </div>
      </div>
    </div>
  );
}
