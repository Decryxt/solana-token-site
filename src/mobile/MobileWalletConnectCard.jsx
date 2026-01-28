import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function getCurrentUrl() {
  try {
    return window.location.href;
  } catch {
    return "https://originfi.net";
  }
}

// Mobile deep links (open your site inside the wallet browser)
function phantomBrowse(url) {
  return `https://phantom.app/ul/browse/${encodeURIComponent(url)}?ref=originfi`;
}

function solflareBrowse(url) {
  return `https://solflare.com/ul/v1/browse?url=${encodeURIComponent(url)}`;
}

export default function MobileWalletConnectCard() {
  const { connected } = useWallet();
  const url = getCurrentUrl();

  // If connected already, don’t show the gate
  if (connected) return null;

  return (
    <div className="rounded-2xl border border-[#1CEAB9] overflow-hidden">
      <div className="bg-[#0B0E11] p-4 text-white">
        <div className="text-base font-semibold">Connect Wallet (Mobile)</div>
        <div className="mt-2 text-sm text-white/70">
          Mobile browsers usually can’t connect to Solana wallets directly.
          Open OriginFi inside a wallet browser, then connect.
        </div>

        <div className="mt-4 grid gap-2">
          <a
            href={phantomBrowse(url)}
            className="w-full text-center rounded-xl border border-[#1CEAB9]/70 bg-black/30 px-4 py-3 text-sm font-semibold text-white hover:border-[#1CEAB9]"
          >
            Open in Phantom
          </a>

          <a
            href={solflareBrowse(url)}
            className="w-full text-center rounded-xl border border-[#1CEAB9]/35 bg-black/30 px-4 py-3 text-sm font-semibold text-white hover:border-[#1CEAB9]/70"
          >
            Open in Solflare
          </a>
        </div>

        <div className="mt-4 text-xs text-white/50">
          If you’re already inside the wallet browser, use Connect below.
        </div>

        <div className="mt-3">
          <WalletMultiButton className="!w-full !bg-[#1CEAB9] !text-black !font-semibold !rounded-xl !py-3" />
        </div>
      </div>
    </div>
  );
}
