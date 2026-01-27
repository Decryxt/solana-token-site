import React from "react";
import {
  FaArrowLeft,
  FaBolt,
  FaChartLine,
  FaShieldAlt,
  FaHistory,
  FaStar,
  FaUserLock,
  FaCheckCircle,
  FaCoins,
  FaArrowUpRight,
} from "react-icons/fa";

export default function AuthPromoCard({
  onBack = () => {},
  title = "Unlock Creator Features",
  subtitle = "Sign in to track your creations, access analytics, and unlock gated tools.",
  perks,
  highlights,
  tip = "Tip: Anything created while signed in will appear automatically in your dashboard.",
}) {
  const defaultPerks = [
    {
      icon: <FaChartLine className="text-[#1CEAB9] text-lg" />,
      title: "Analytics access",
      desc: "View insights for tokens tied to your account.",
    },
    {
      icon: <FaHistory className="text-[#7CF7D4] text-lg" />,
      title: "Saved history",
      desc: "Come back anytime—your tokens stay organized.",
    },
    {
      icon: <FaShieldAlt className="text-[#1CEAB9] text-lg" />,
      title: "Cleaner access",
      desc: "Limits random browsing and scraping.",
    },
    {
      icon: <FaBolt className="text-[#FFD37A] text-lg" />,
      title: "Faster workflow",
      desc: "Less re-entry when using tools repeatedly.",
    },
  ];

  const defaultHighlights = [
    { icon: <FaCheckCircle className="text-[#1CEAB9]" />, text: "Private dashboard tied to you" },
    { icon: <FaUserLock className="text-[#7CF7D4]" />, text: "Gated tools + saved progress" },
    { icon: <FaStar className="text-[#FFD37A]" />, text: "Future perks expand over time" },
  ];

  const perksToUse = perks?.length ? perks : defaultPerks;
  const highlightsToUse = highlights?.length ? highlights : defaultHighlights;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-[#1CEAB9]/20 shrink-0">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#1CEAB9]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#FFD37A]/8 blur-3xl" />
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

            {/* Centered hint */}
            <div className="hidden md:flex items-center gap-2 text-xs text-white/60">
              <FaArrowUpRight className="text-[#1CEAB9]" />
              Go to <span className="text-white/85">Account</span> (top-right) to sign in — it’s free
            </div>
          </div>

          {/* Centered title area */}
          <div className="relative z-10 mt-4 flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl border border-[#1CEAB9]/40 bg-[#101418] flex items-center justify-center">
              <FaCoins className="text-[#1CEAB9] text-xl" />
            </div>

            <h2 className="mt-3 text-xl sm:text-2xl font-bold text-white leading-tight">
              {title}
            </h2>

            <p className="mt-2 max-w-[42rem] text-xs sm:text-sm text-white/70 leading-snug">
              {subtitle}
            </p>

            {/* Free note */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <FaCheckCircle className="text-[#1CEAB9]" />
              <span className="text-[11px] sm:text-xs text-white/80">
                Creating an account is <span className="text-white font-semibold">100% free</span> — no cost, no commitment.
              </span>
            </div>

            {/* Tight pills */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-2 text-[11px] text-white/80 border border-[#1CEAB9]/30 bg-white/5 px-2 py-1 rounded-full">
                <FaCheckCircle className="text-[#1CEAB9]" />
                Saved history
              </span>
              <span className="inline-flex items-center gap-2 text-[11px] text-white/80 border border-[#7CF7D4]/30 bg-white/5 px-2 py-1 rounded-full">
                <FaCheckCircle className="text-[#7CF7D4]" />
                Analytics access
              </span>
              <span className="inline-flex items-center gap-2 text-[11px] text-white/80 border border-[#FFD37A]/25 bg-white/5 px-2 py-1 rounded-full">
                <FaCheckCircle className="text-[#FFD37A]" />
                Creator perks
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex-1 flex flex-col items-center">
          <div className="w-full max-w-3xl">
            {/* Perks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {perksToUse.slice(0, 4).map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#1CEAB9]/18 bg-[#101418] px-3 py-3 hover:border-[#1CEAB9]/35 transition"
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

            {/* Highlights */}
            <div className="mt-4 rounded-xl border border-[#1CEAB9]/18 bg-white/5 px-3 py-3">
              <div className="flex items-center justify-center gap-2 text-white font-semibold text-sm">
                <FaBolt className="text-[#1CEAB9]" />
                What you unlock by signing in
              </div>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {highlightsToUse.slice(0, 3).map((h, idx) => (
                  <div key={idx} className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{h.icon}</div>
                      <div className="text-[12px] text-white/80 leading-snug">
                        {h.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {tip ? (
                <div className="mt-2 text-center text-[11px] text-white/50">
                  {tip}
                </div>
              ) : null}
            </div>

            {/* Bottom helper (centered) */}
            <div className="mt-4 text-center text-[11px] text-white/45">
              To continue: use the <span className="text-white/70 font-semibold">Account</span> button in the top-right.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
