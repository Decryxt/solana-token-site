import React from "react";
import {
  FaArrowLeft,
  FaChartLine,
  FaHistory,
  FaShieldAlt,
  FaBolt,
  FaCheckCircle,
  FaCoins,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function AuthPromoCard({
  onBack = () => {},
  title = "Unlock Creator Features",
  subtitle = "Sign in to access analytics, saved history, and gated creator tools.",
}) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-[#1CEAB9]/20">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <FaArrowLeft />
            Back
          </button>

          <div className="mt-3 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl border border-[#1CEAB9]/40 bg-[#101418] flex items-center justify-center">
              <FaCoins className="text-[#1CEAB9]" />
            </div>

            <h2 className="mt-3 text-xl font-bold text-white">{title}</h2>
            <p className="mt-1 text-sm text-white/70 max-w-xl">
              {subtitle}
            </p>

            <div className="mt-2 inline-flex items-center gap-2 text-xs border border-white/10 bg-white/5 px-3 py-1.5 rounded-full">
              <FaCheckCircle className="text-[#1CEAB9]" />
              <span className="text-white/80">
                Creating an account is <strong>100% free</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-md space-y-3">
            <Feature
              icon={<FaChartLine className="text-[#1CEAB9]" />}
              title="Token analytics"
              desc="View performance data for tokens you create."
            />
            <Feature
              icon={<FaHistory className="text-[#7CF7D4]" />}
              title="Saved history"
              desc="Your tokens stay linked to your account."
            />
            <Feature
              icon={<FaShieldAlt className="text-[#1CEAB9]" />}
              title="Account-based access"
              desc="Keeps advanced tools gated and organized."
            />
            <Feature
              icon={<FaBolt className="text-[#FFD37A]" />}
              title="Future perks"
              desc="Alerts, exports, and deeper insights later."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 text-center text-xs text-white/55">
          <FaExternalLinkAlt className="inline mr-1 text-[#1CEAB9]" />
          Use the <strong>Account</strong> button (top-right) to sign in or create a free account.
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-white/65 leading-snug">{desc}</div>
      </div>
    </div>
  );
}
