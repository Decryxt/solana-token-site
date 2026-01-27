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
} from "react-icons/fa";

export default function AuthPromoCard({
  onBack = () => {},

  title = "Unlock Creator Features",
  subtitle = "Sign in to track your creations, access analytics, and unlock gated tools.",

  primaryHint = "Sign in",
  secondaryHint = "Create account",
  showSecondary = true,

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
      icon: <FaHistory className="text-[#1CEAB9] text-lg" />,
      title: "Saved history",
      desc: "Come back anytime—your tokens stay organized.",
    },
    {
      icon: <FaShieldAlt className="text-[#1CEAB9] text-lg" />,
      title: "Cleaner access",
      desc: "Limits random browsing and scraping.",
    },
    {
      icon: <FaBolt className="text-[#1CEAB9] text-lg" />,
      title: "Faster workflow",
      desc: "Less re-entry when using tools repeatedly.",
    },
  ];

  const defaultHighlights = [
    { icon: <FaCheckCircle className="text-[#1CEAB9]" />, text: "Private dashboard tied to you" },
    { icon: <FaUserLock className="text-[#1CEAB9]" />, text: "Gated tools + saved progress" },
    { icon: <FaStar className="text-[#1CEAB9]" />, text: "Future perks: alerts, export, deeper insights" },
  ];

  const perksToUse = perks?.length ? perks : defaultPerks;
  const highlightsToUse = highlights?.length ? highlights : defaultHighlights;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-2xl overflow-hidden flex flex-col">
        {/* Header (more compact) */}
        <div className="relative px-4 pt-4 pb-3 border-b border-[#1CEAB9]/20 shrink-0">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#1CEAB9]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#1CEAB9]/10 blur-3xl" />
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

            <div className="hidden sm:flex items-center gap-2 text-xs text-white/65">
              <FaBolt className="text-[#1CEAB9]" />
              Account perks enabled
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

              {/* Pills (tight) */}
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 text-[11px] text-white/80 border border-[#1CEAB9]/30 bg-white/5 px-2 py-1 rounded-full">
                  <FaCheckCircle className="text-[#1CEAB9]" />
                  Saved history
                </span>
                <span className="inline-flex items-center gap-2 text-[11px] text-white/80 border border-[#1CEAB9]/30 bg-white/5 px-2 py-1 rounded-full">
                  <FaCheckCircle className="text-[#1CEAB9]" />
                  Analytics access
                </span>
                <span className="inline-flex items-center gap-2 text-[11px] text-white/80 border border-[#1CEAB9]/30 bg-white/5 px-2 py-1 rounded-full">
                  <FaCheckCircle className="text-[#1CEAB9]" />
                  Gated tools
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body (denser layout) */}
        <div className="px-4 py-4 flex-1 flex flex-col">
          {/* Perks: compact cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {perksToUse.slice(0, 4).map((p, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#1CEAB9]/18 bg-[#101418] px-3 py-3 hover:border-[#1CEAB9]/35 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg border border-[#1CEAB9]/25 bg-black/30 flex items-center justify-center">
                    {p.icon || <FaBolt className="text-[#1CEAB9] text-lg" />}
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

          {/* Highlights: tighter block */}
          <div className="mt-4 rounded-xl border border-[#1CEAB9]/18 bg-white/5 px-3 py-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <FaBolt className="text-[#1CEAB9]" />
              What you get
            </div>

            {/* Use 1 column on small screens to reduce vertical complexity */}
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {highlightsToUse.slice(0, 3).map((h, idx) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{h.icon || <FaCheckCircle className="text-[#1CEAB9]" />}</div>
                    <div className="text-[12px] text-white/80 leading-snug">
                      {h.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {tip ? <div className="mt-2 text-[11px] text-white/50">{tip}</div> : null}
          </div>

          {/* CTA pinned bottom (tight) */}
          <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              className="w-full sm:w-1/2 rounded-xl border border-[#1CEAB9] bg-[#0B0E11] hover:bg-[#0F141A] text-white py-2 font-semibold text-sm transition"
            >
              {primaryHint}
            </button>

            {showSecondary && (
              <button
                type="button"
                className="w-full sm:w-1/2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white py-2 font-semibold text-sm transition"
              >
                {secondaryHint}
              </button>
            )}
          </div>

          <div className="mt-2 text-center text-[11px] text-white/45">
            No spam. Just a better creator experience.
          </div>
        </div>
      </div>
    </div>
  );
}
