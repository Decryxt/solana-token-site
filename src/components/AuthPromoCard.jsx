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
  FaLayerGroup,
} from "react-icons/fa";

export default function AuthPromoCard({
  onBack = () => {},
  title = "Account Required",
  subtitle = "This feature is gated to signed-in creators to keep dashboards private and analytics organized.",
}) {
  const perks = [
    {
      icon: <FaChartLine className="text-[#1CEAB9] text-base" />,
      title: "Analytics & insights",
      desc: "View token stats tied to your account.",
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
      title: "Cleaner access control",
      desc: "Limits random browsing and scraping.",
      accent: "border-[#1CEAB9]/25",
    },
    {
      icon: <FaBolt className="text-[#FFD37A] text-base" />,
      title: "Faster workflow",
      desc: "Pick up where you left off instantly.",
      accent: "border-[#FFD37A]/25",
    },
  ];

  return (
    // Fill the dashboard rectangle perfectly
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-xl overflow-hidden flex flex-col">
        {/* Top / Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-[#1CEAB9]/20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#1CEAB9]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#FFD37A]/8 blur-3xl" />
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

          <div className="relative z-10 mt-4 flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl border border-[#1CEAB9]/40 bg-[#101418] flex items-center justify-center">
              <FaCoins className="text-[#1CEAB9] text-2xl" />
            </div>

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-white leading-tight">{title}</h2>
              <p className="mt-1 text-sm text-white/70 leading-snug">
                {subtitle}
              </p>

              {/* BIG FREE BADGE (very visible) */}
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#1CEAB9]/35 bg-[#1CEAB9]/10 px-3 py-2">
                <FaCheckCircle className="text-[#1CEAB9]" />
                <span className="text-sm text-white font-semibold">
                  100% FREE — no cost, no commitment
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle / Content: uses space intelligently */}
        <div className="flex-1 px-6 py-5 flex flex-col">
          {/* Compact “Why” strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <MiniTag icon={<FaLock className="text-[#7CF7D4]" />} text="Private creator dashboard" />
            <MiniTag icon={<FaLayerGroup className="text-[#FFD37A]" />} text="Saved token history" />
            <MiniTag icon={<FaShieldAlt className="text-[#1CEAB9]" />} text="Less scraping / browsing" />
          </div>

          {/* Perks */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {perks.map((p, idx) => (
              <div
                key={idx}
                className={`rounded-xl border ${p.accent} bg-[#101418] px-4 py-3`}
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

          {/* Filler but useful: Steps (compact) */}
          <div className="mt-auto pt-4">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center justify-center gap-2 text-white font-semibold text-sm">
                <FaBolt className="text-[#1CEAB9]" />
                Quick steps
              </div>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Step n="1" text="Click Account (top-right)" />
                <Step n="2" text="Sign in or create a free account" />
                <Step n="3" text="Return here to continue" />
              </div>

              <div className="mt-2 text-center text-[11px] text-white/50">
                Creating an account is free. You can use OriginFi without any commitment.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniTag({ icon, text }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 flex items-center gap-2">
      <div className="shrink-0">{icon}</div>
      <div className="text-xs text-white/75 leading-snug">{text}</div>
    </div>
  );
}

function Step({ n, text }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
      <div className="text-[11px] text-white/55">Step {n}</div>
      <div className="text-xs text-white/80 leading-snug">{text}</div>
    </div>
  );
}
