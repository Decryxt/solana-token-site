import React from "react";
import {
  FaArrowLeft,
  FaChartLine,
  FaShieldAlt,
  FaHistory,
  FaBolt,
  FaCheckCircle,
  FaCoins,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function AuthPromoCard({
  onBack = () => {},
  title = "Sign in to unlock this feature",
  subtitle = "Account-based access keeps dashboards private and analytics organized.",
}) {
  const perks = [
    {
      icon: <FaChartLine className="text-[#1CEAB9] text-base" />,
      title: "Analytics",
      desc: "Insights for tokens tied to your account.",
      border: "border-[#1CEAB9]/25",
      bg: "bg-[#1CEAB9]/5",
    },
    {
      icon: <FaHistory className="text-[#7CF7D4] text-base" />,
      title: "Saved history",
      desc: "Your created tokens stay organized.",
      border: "border-[#7CF7D4]/25",
      bg: "bg-[#7CF7D4]/5",
    },
    {
      icon: <FaShieldAlt className="text-[#A78BFA] text-base" />,
      title: "Private access",
      desc: "Less random browsing & scraping.",
      border: "border-[#A78BFA]/25",
      bg: "bg-[#A78BFA]/5",
    },
    {
      icon: <FaBolt className="text-[#FFD37A] text-base" />,
      title: "Faster workflow",
      desc: "Come back anytime and continue.",
      border: "border-[#FFD37A]/25",
      bg: "bg-[#FFD37A]/5",
    },
  ];

  return (
    // Strictly fill the dashboard rectangle
    <div className="w-full h-full">
      <div className="w-full h-full rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-xl overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="px-5 pt-4 pb-3 border-b border-[#1CEAB9]/20 shrink-0">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
            >
              <FaArrowLeft />
              Back
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
              <FaExternalLinkAlt className="text-[#1CEAB9]" />
              Use <span className="text-white/80 font-semibold">Account</span> (top-right)
            </div>
          </div>

          {/* Centered title block */}
          <div className="mt-3 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl border border-[#1CEAB9]/35 bg-[#101418] flex items-center justify-center">
              <FaCoins className="text-[#1CEAB9] text-xl" />
            </div>

            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white leading-tight">
              {title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/70 leading-snug max-w-xl">
              {subtitle}
            </p>

            {/* High-visibility FREE badge */}
            <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[#1CEAB9]/35 bg-[#1CEAB9]/10 px-3 py-1.5">
              <FaCheckCircle className="text-[#1CEAB9]" />
              <span className="text-xs sm:text-sm text-white font-semibold">
                100% FREE — no cost, no commitment
              </span>
            </div>
          </div>
        </div>

        {/* Body: no overflow, no dead bottom space */}
        <div className="flex-1 px-5 py-4 flex flex-col justify-between">
          {/* Perks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {perks.map((p, idx) => (
              <div
                key={idx}
                className={`rounded-xl border ${p.border} ${p.bg} bg-[#101418] px-3 py-2.5`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center">
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

          {/* Bottom hint pinned, eliminates random empty space */}
          <div className="pt-3 text-center text-[11px] text-white/55">
            After signing in, come back here and you’ll have access automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
