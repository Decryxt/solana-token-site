import React from "react";
import { Rocket, ShieldCheck } from "lucide-react";

export default function GlassCards() {
  return (
    <div className="mt-28 flex flex-col md:flex-row justify-center gap-8 max-w-3xl mx-auto px-4">
      <div className="glass-card p-6 flex-1">
        <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
          <Rocket className="w-5 h-5 text-[#1CEAB9]" />
          Create Tokens Instantly
        </h3>
        <p className="text-sm opacity-80 text-center">
          Launch your own Solana tokens with ease and speed. No coding required.
        </p>
      </div>

      <div className="glass-card p-6 flex-1">
        <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#1CEAB9]" />
          Powered by Solana
        </h3>
        <p className="text-sm opacity-80 text-center">
          Benefit from Solana’s fast, secure, and scalable blockchain technology.
        </p>
      </div>

      <style>{`
        .glass-card {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 1rem;
          border: 1px solid #1CEAB9;
          color: white;
          transition: background-color 0.3s ease;
        }

        .glass-card:hover {
          background: rgba(0, 0, 0, 0.55);
        }
      `}</style>
    </div>
  );
}
