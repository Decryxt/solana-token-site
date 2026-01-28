import React from "react";

function getCurrentUrl() {
  try {
    return window.location.href;
  } catch {
    return "https://originfi.net";
  }
}

function phantomBrowse(url) {
  return `https://phantom.app/ul/browse/${encodeURIComponent(url)}`;
}

function solflareBrowse(url) {
  return `https://solflare.com/ul/v1/browse/${encodeURIComponent(url)}`;
}

export default function MobileWalletGate() {
  const url = getCurrentUrl();

  return (
    <div className="rounded-2xl border border-[#1CEAB9] overflow-hidden">
      <div className="bg-[#0B0E11] p-4 text-white">
        <div className="text-lg font-bold">Wallet Connection</div>
        <div className="mt-2 text-sm text-white/70">
          On mobile, open OriginFi inside a Solana wallet browser to connect.
        </div>

        <div className="mt-4 grid gap-3">
          <a
            href={phantomBrowse(url)}
            className="w-full rounded-xl border border-[#1CEAB9]/70 bg-black/30 px-4 py-3 text-sm font-semibold text-white text-center hover:border-[#1CEAB9]"
          >
            Open in Phantom
          </a>

          <a
            href={solflareBrowse(url)}
            className="w-full rounded-xl border border-[#1CEAB9]/35 bg-black/30 px-4 py-3 text-sm font-semibold text-white text-center hover:border-[#1CEAB9]/70"
          >
            Open in Solflare
          </a>
        </div>

        <div className="mt-4 text-xs text-white/50">
          After it opens inside the wallet, come back and tap Connect.
        </div>
      </div>
    </div>
  );
}
