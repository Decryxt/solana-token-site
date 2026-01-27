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
 * UI-only card (no routing, no auth logic).
 * Use `onBack` to close/hide it from the parent.
 */
export default function AuthPromoCard({
  onBack = () => {},
  title = "Unlock OriginFi Analytics",
  subtitle = "Create an account or sign in to track your tokens, view analytics, and access your creator dashboard.",
  primaryHint = "Sign in",
  secondaryHint = "Create account",
}) {
  const perks = [
    {
      icon: <FaChartLine className="text-[#1CEAB9] text-xl" />,
      title: "Token analytics dashboard",
      desc: "View performance insights for tokens you’ve created — in one place.",
    },
    {
      icon: <FaHistory className="text-[#1CEAB9] text-xl" />,
      title: "History & tracking",
      desc: "Keep your creations organized so you can come back anytime.",
    },
    {
      icon: <FaShieldAlt className="text-[#1CEAB9] text-xl" />,
      title: "Safer creator experience",
      desc: "Account-based tracking helps prevent random browsing and scraping.",
    },
    {
      icon: <FaBolt className="text-[#1CEAB9] text-xl" />,
      title: "Faster workflow",
      desc: "Manage your tokens and analytics without re-entering details.",
    },
  ];

  const highlights = [
    { icon: <FaCheckCircle className="text-[#1CEAB9]" />, text: "Access analytics for tokens you create" },
    { icon: <FaUserLock className="text-[#1CEAB9]" />, text: "Private dashboard tied to your account" },
    { icon: <FaStar className="text-[#1CEAB9]" />, text: "Future perks: alerts, exports, deeper insights" },
  ];

  return (
    <div className="w-full flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-[#1CEAB9]/20">
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
              <h2 className="text-2xl font-bold text-white leading-tight">
                {title}
              </h2>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                {subtitle}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 text-xs text-white/80 border border-[#1CEAB9]/30 bg-white/5 px-3 py-1.5 rounded-full">
                  <FaCheckCircle className="text-[#1CEAB9]" />
                  Saved token history
                </span>
                <span className="inline-flex items-center gap-2 text-xs text-white/80 border border-[#1CEAB9]/30 bg-white/5 px-3 py-1.5 rounded-full">
                  <FaCheckCircle className="text-[#1CEAB9]" />
                  Private analytics access
                </span>
                <span className="inline-flex items-center gap-2 text-xs text-white/80 border border-[#1CEAB9]/30 bg-white/5 px-3 py-1.5 rounded-full">
                  <FaCheckCircle className="text-[#1CEAB9]" />
                  Creator dashboard perks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Perks grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {perks.map((p, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#1CEAB9]/20 bg-[#101418] p-4 hover:border-[#1CEAB9]/40 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg border border-[#1CEAB9]/30 bg-black/30 flex items-center justify-center">
                    {p.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-semibold">{p.title}</div>
                    <div className="mt-1 text-sm text-white/65 leading-relaxed">
                      {p.desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className="mt-6 rounded-xl border border-[#1CEAB9]/20 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-white font-semibold">
              <FaBolt className="text-[#1CEAB9]" />
              Why sign in?
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {highlights.map((h, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-white/10 bg-black/20 p-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{h.icon}</div>
                    <div className="text-sm text-white/80 leading-snug">
                      {h.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-white/50">
              Tip: If you already minted tokens while signed in, you’ll see them automatically in Analytics.
            </div>
          </div>

          {/* CTA buttons (no logic) */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="w-full sm:w-1/2 rounded-xl border border-[#1CEAB9] bg-[#0B0E11] hover:bg-[#0F141A] text-white py-2.5 font-semibold transition"
            >
              {primaryHint}
            </button>
            <button
              type="button"
              className="w-full sm:w-1/2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white py-2.5 font-semibold transition"
            >
              {secondaryHint}
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-white/45">
            No spam. Just a better creator experience.
          </div>
        </div>
      </div>
    </div>
  );
}
