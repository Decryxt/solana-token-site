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
  FaLock,
} from "react-icons/fa";

export default function AuthPromoCard({
  onBack = () => {},
  title = "Sign in to unlock this feature",
  subtitle = "We keep certain tools account-based so your dashboard stays private and organized.",
}) {
  const perks = [
    {
      icon: <FaChartLine className="text-[#1CEAB9] text-base" />,
      title: "Analytics",
      desc: "Insights for tokens tied to your account.",
      accent: "border-[#1CEAB9]/25",
    },
    {
      icon: <FaHistory className="text-[#7CF7D4] text-base" />,
      title: "Saved history",
      desc: "Your created tokens stay organized.",
      accent: "border-[#7CF7D4]/25",
    },
    {
      icon: <FaShieldAlt className="text-[#1CEAB9] text-base" />,
      title: "Cleaner access",
      desc: "Less random browsing & scraping.",
      accent: "border-[#1CEAB9]/25",
    },
    {
      icon: <FaBolt className="text-[#FFD37A] text-base" />,
      title: "Faster workflow",
      desc: "Come back anytime and continue.",
      accent: "border-[#FFD37A]/25",
    },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-xl overflow-hidden flex flex-col">
        {/* Header (tight) */}
        <div className="relative px-5 pt-4 pb-3 border-b border-[#1CEAB9]/20 shrink-0">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#1CEAB9]/10 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
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

          <div className="relative z-10 mt-3 flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-xl border border-[#1CEAB9]/40 bg-[#101418] flex items-center justify-center">
              <FaCoins className="text-[#1CEAB9] text-xl" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white leading-tight">{title}</h2>
              <p className="mt-1 text-xs sm:text-sm text-white/70 leading-snug">
                {subtitle}
              </p>

              {/* BIG FREE LINE (visible, but compact) */}
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#1CEAB9]/35 bg-[#1CEAB9]/10 px-3 py-1.5">
                <FaCheckCircle className="text-[#1CEAB9]" />
                <span className="text-xs sm:text-sm text-white font-semibold">
                  100% FREE — no cost, no commitment
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body (fits) */}
        <div className="flex-1 px-5 py-4 flex flex-col gap-3">
          {/* Mini strip (single row on desktop, compact on mobile) */}
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
            <FaLock className="text-[#7CF7D4]" />
            <div className="text-xs text-white/75 leading-snug">
              Your dashboard stays private. Analytics only show tokens created while signed in.
            </div>
          </div>

          {/* Perks grid (compact) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {perks.map((p, idx) => (
              <div
                key={idx}
                className={`rounded-xl border ${p.accent} bg-[#101418] px-3 py-2.5`}
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

          {/* Bottom hint (tiny) */}
          <div className="text-center text-[11px] text-white/50 mt-auto">
            Continue by clicking <span className="text-white/70 font-semibold">Account</span> in the top-right.
          </div>
        </div>
      </div>
    </div>
  );
}
