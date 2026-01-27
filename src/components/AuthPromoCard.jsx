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

/**
 * Universal, UI-only promo card (no routing/auth logic).
 * Designed to fit inside an existing container (like TokenDashboard panel) without causing scroll.
 */
export default function AuthPromoCard({
  onBack = () => {},

  // Core copy
  title = "Unlock Creator Features",
  subtitle = "Create an account or sign in to access premium creator tools and keep everything organized under your profile.",

  // CTA button labels (UI only)
  primaryHint = "Sign in",
  secondaryHint = "Create account",
  showSecondary = true,

  // Perks + highlights are customizable so this is universal
  perks,
  highlights,

  // Optional: show small tip line
  tip = "Tip: Anything created while signed in will automatically appear in your dashboard.",
}) {
  const defaultPerks = [
    {
      icon: <FaChartLine className="text-[#1CEAB9] text-xl" />,
      title: "Creator dashboard",
      desc: "Keep track of what you’ve created — all in one place.",
    },
    {
      icon: <FaHistory className="text-[#1CEAB9] text-xl" />,
      title: "History & organization",
      desc: "Come back later and pick up where you left off.",
    },
    {
      icon: <FaShieldAlt className="text-[#1CEAB9] text-xl" />,
      title: "Cleaner access control",
      desc: "Limits random browsing and keeps tools account-based.",
    },
    {
      icon: <FaBolt className="text-[#1CEAB9] text-xl" />,
      title: "Faster workflow",
      desc: "Less friction when using advanced tools repeatedly.",
    },
  ];

  const defaultHighlights = [
    { icon: <FaCheckCircle className="text-[#1CEAB9]" />, text: "Account-based access to gated tools" },
    { icon: <FaUserLock className="text-[#1CEAB9]" />, text: "Private dashboard tied to you" },
    { icon: <FaStar className="text-[#1CEAB9]" />, text: "Future perks expand over time" },
  ];

  const perksToUse = perks?.length ? perks : defaultPerks;
  const highlightsToUse = highlights?.length ? highlights : defaultHighlights;

  return (
    // IMPORTANT: no outer py/px that would fight the dashboard panel size
    <div className="w-full h-full flex items-center justify-center">
      {/* Fill the available panel area */}
      <div className="w-full h-full max-w-none rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 border-b border-[#1CEAB9]/20 shrink-0">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#1CEAB9]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#1CEAB9]/10 blur-3xl" />
          </div>

          <button
            type="button"
            onClick={onBack}
            className="relative z-10 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <FaArrowLeft />
            Back
          </button>

          <div className="relative z-10 mt-4 flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl border border-[#1CEAB9]/40 bg-[#101418] flex items-center justify-center">
              <FaCoins className="text-[#1CEAB9] text-2xl" />
            </div>

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-white leading-tight">{title}</h2>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">{subtitle}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 text-xs text-white/80 border border-[#1CEAB9]/30 bg-white/5 px-3 py-1.5 rounded-full">
                  <FaCheckCircle className="text-[#1CEAB9]" />
                  Saved history
                </span>
                <span className="inline-flex items-center gap-2 text-xs text-white/80 border border-[#1CEAB9]/30 bg-white/5 px-3 py-1.5 rounded-full">
                  <FaCheckCircle className="text-[#1CEAB9]" />
                  Account perks
                </span>
                <span className="inline-flex items-center gap-2 text-xs text-white/80 border border-[#1CEAB9]/30 bg-white/5 px-3 py-1.5 rounded-full">
                  <FaCheckCircle className="text-[#1CEAB9]" />
                  Premium tools
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body: use remaining height, avoid scroll by design */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Perks grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {perksToUse.slice(0, 4).map((p, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#1CEAB9]/20 bg-[#101418] p-4 hover:border-[#1CEAB9]/40 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg border border-[#1CEAB9]/30 bg-black/30 flex items-center justify-center">
                    {p.icon || <FaBolt className="text-[#1CEAB9] text-xl" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-semibold">{p.title}</div>
                    <div className="mt-1 text-sm text-white/65 leading-relaxed">{p.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className="mt-6 rounded-xl border border-[#1CEAB9]/20 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-white font-semibold">
              <FaBolt className="text-[#1CEAB9]" />
              What you get
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {highlightsToUse.slice(0, 3).map((h, idx) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{h.icon || <FaCheckCircle className="text-[#1CEAB9]" />}</div>
                    <div className="text-sm text-white/80 leading-snug">{h.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {tip ? <div className="mt-4 text-xs text-white/50">{tip}</div> : null}
          </div>

          {/* CTA buttons pinned toward bottom; still UI-only */}
          <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="w-full sm:w-1/2 rounded-xl border border-[#1CEAB9] bg-[#0B0E11] hover:bg-[#0F141A] text-white py-2.5 font-semibold transition"
            >
              {primaryHint}
            </button>

            {showSecondary && (
              <button
                type="button"
                className="w-full sm:w-1/2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white py-2.5 font-semibold transition"
              >
                {secondaryHint}
              </button>
            )}
          </div>

          <div className="mt-4 text-center text-xs text-white/45">
            No spam. Just a better creator experience.
          </div>
        </div>
      </div>
    </div>
  );
}
