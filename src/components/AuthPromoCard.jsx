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
  FaLock,
  FaUserShield,
  FaLayerGroup,
} from "react-icons/fa";

export default function AuthPromoCard({
  onBack = () => {},
  title = "Sign in or Create account to unlock this feature",
  subtitle = "Account-based access keeps dashboards private, organized, and harder to scrape.",
}) {
  const perks = [
    {
      icon: <FaChartLine className="text-[#1CEAB9] text-base" />,
      title: "Analytics",
      desc: "Insights for tokens tied to your account.",
      border: "border-[#1CEAB9]/25",
      tint: "bg-[#1CEAB9]/6",
    },
    {
      icon: <FaHistory className="text-[#7CF7D4] text-base" />,
      title: "Saved history",
      desc: "Your created tokens stay organized.",
      border: "border-[#7CF7D4]/25",
      tint: "bg-[#7CF7D4]/6",
    },
    {
      icon: <FaShieldAlt className="text-[#A78BFA] text-base" />,
      title: "Private access",
      desc: "Less random browsing & scraping.",
      border: "border-[#A78BFA]/25",
      tint: "bg-[#A78BFA]/6",
    },
    {
      icon: <FaBolt className="text-[#FFD37A] text-base" />,
      title: "Faster workflow",
      desc: "Come back anytime and continue.",
      border: "border-[#FFD37A]/25",
      tint: "bg-[#FFD37A]/6",
    },
  ];

  const unlocks = [
    {
      icon: <FaLock className="text-[#7CF7D4]" />,
      label: "Gated tools",
      sub: "Advanced creator features",
    },
    {
      icon: <FaLayerGroup className="text-[#1CEAB9]" />,
      label: "Dashboard",
      sub: "Everything in one place",
    },
    {
      icon: <FaUserShield className="text-[#A78BFA]" />,
      label: "Creator privacy",
      sub: "Account-linked access",
    },
  ];

  return (
    // Strictly fill the dashboard rectangle — never go outside
    <div className="w-full h-full">
      <div className="w-full h-full rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-xl overflow-hidden flex flex-col">
        {/* Top Bar + Horizontal Header (height-efficient) */}
        <div className="relative px-6 pt-4 pb-3 border-b border-[#1CEAB9]/20 shrink-0">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#1CEAB9]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#A78BFA]/8 blur-3xl" />
          </div>

          {/* Back + account hint */}
          <div className="relative z-10 flex items-center justify-between mb-3">
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
              Use <span className="text-white/80 font-semibold">Sign In</span>{" "}
              (top-right)
            </div>
          </div>

          {/* Main header row */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Left: title */}
            <div className="md:col-span-2 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl border border-[#1CEAB9]/35 bg-[#101418] flex items-center justify-center">
                <FaCoins className="text-[#1CEAB9] text-xl" />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-bold text-white leading-tight">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-white/70 leading-snug">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Right: FREE badge */}
            <div className="flex md:justify-end">
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#1CEAB9]/40 bg-[#1CEAB9]/12 px-4 py-2">
                <FaCheckCircle className="text-[#1CEAB9]" />
                <span className="text-sm text-white font-bold">
                  100% FREE
                </span>
                <span className="hidden lg:inline text-xs text-white/70">
                  — no cost, no commitment
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body (fills remaining height; no overflow outside rectangle) */}
        <div className="flex-1 px-6 py-5 flex flex-col">
          {/* What you unlock (compact; fills space better) */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
              <FaBolt className="text-[#FFD37A]" />
              What you unlock
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {unlocks.map((u, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{u.icon}</div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white/90 leading-tight">
                        {u.label}
                      </div>
                      <div className="text-[11px] text-white/55 leading-snug">
                        {u.sub}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 text-center text-[11px] text-white/55">
              We gate certain tools to keep analytics private and reduce automated scraping.
            </div>
          </div>

          {/* Perks grid */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {perks.map((p, idx) => (
              <div
                key={idx}
                className={`rounded-xl border ${p.border} ${p.tint} bg-[#101418] px-3 py-2.5`}
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

          {/* Bottom conversion line pinned */}
          <div className="mt-auto pt-4 text-center text-xs text-white/70">
            Click{" "}
            <span className="text-white font-semibold">Sign In</span> (top-right)
            to continue — then come back here.
          </div>
        </div>
      </div>
    </div>
  );
}
