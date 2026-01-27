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
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function AuthPromoCard({
  onBack = () => {},
  title = "Unlock Creator Features",
  subtitle = "Sign in to track your creations, access analytics, and unlock gated tools tied to your account.",
  tip = "Tip: Anything created while signed in appears automatically in your dashboard.",
}) {
  const perks = [
    {
      icon: <FaChartLine className="text-[#1CEAB9] text-lg" />,
      title: "Token analytics",
      desc: "View performance data for tokens you create.",
    },
    {
      icon: <FaHistory className="text-[#7CF7D4] text-lg" />,
      title: "Saved history",
      desc: "Your creations stay organized under your profile.",
    },
    {
      icon: <FaShieldAlt className="text-[#1CEAB9] text-lg" />,
      title: "Account-based access",
      desc: "Gated tools stay private and harder to scrape.",
    },
    {
      icon: <FaBolt className="text-[#FFD37A] text-lg" />,
      title: "Future perks",
      desc: "Alerts, exports, and deeper insights later.",
    },
  ];

  const highlights = [
    { icon: <FaCheckCircle className="text-[#1CEAB9]" />, text: "Private creator dashboard" },
    { icon: <FaUserLock className="text-[#7CF7D4]" />, text: "Gated tools + saved progress" },
    { icon: <FaStar className="text-[#FFD37A]" />, text: "More features over time" },
  ];

  return (
    <div className="w-full flex items-start justify-center px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-[#1CEAB9]/20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#1CEAB9]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#FFD37A]/8 blur-3xl" />
          </div>

          <button
            type="button"
            onClick={onBack}
            className="relative z-10 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <FaArrowLeft />
            Back
          </button>

          <div className="relative z-10 mt-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl border border-[#1CEAB9]/40 bg-[#101418] flex items-center justify-center">
              <FaCoins className="text-[#1CEAB9] text-2xl" />
            </div>

            <h2 className="mt-3 text-2xl font-bold text-white">{title}</h2>
            <p className="mt-2 text-sm text-white/70 max-w-2xl">{subtitle}</p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <FaCheckCircle className="text-[#1CEAB9]" />
              <span className="text-xs text-white/80">
                Creating an account is <span className="text-white font-semibold">100% free</span> — no cost, no commitment.
              </span>
            </div>

            <div className="mt-3 text-xs text-white/55">
              <FaExternalLinkAlt className="inline mr-1 text-[#1CEAB9]" />
              Use the <span className="text-white/75 font-semibold">Account</span> button (top-right) to sign in.
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {perks.map((p, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#1CEAB9]/18 bg-[#101418] px-4 py-3 hover:border-[#1CEAB9]/35 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center">
                    {p.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-semibold text-sm">{p.title}</div>
                    <div className="mt-0.5 text-xs text-white/65 leading-snug">{p.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-[#1CEAB9]/18 bg-white/5 px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-white font-semibold text-sm">
              <FaBolt className="text-[#1CEAB9]" />
              What you unlock
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {highlights.map((h, idx) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{h.icon}</div>
                    <div className="text-xs text-white/80 leading-snug">{h.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-center text-[11px] text-white/50">{tip}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
