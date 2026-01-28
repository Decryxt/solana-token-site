// src/components/WalletConnect.jsx
import React from "react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import useIsMobile from "../hooks/useIsMobile";

function getCurrentUrl() {
  try {
    return window.location.href;
  } catch {
    return "https://originfi.net";
  }
}

// ✅ More reliable mobile deep links
function phantomBrowse(url) {
  return `https://phantom.app/ul/browse/${encodeURIComponent(url)}?ref=originfi`;
}

function solflareBrowse(url) {
  return `https://solflare.com/ul/v1/browse?url=${encodeURIComponent(url)}`;
}

export default function WalletConnect() {
  const { connected, publicKey } = useWallet();
  const isMobile = useIsMobile();
  const url = getCurrentUrl();

  return (
    <div className="bg-[#0B0E11] border border-[#1CEAB9] rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto text-white">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold">Wallet Connection</h2>

        {/* 📱 Mobile helper (only when not connected) */}
        {isMobile && !connected && (
          <div className="w-full rounded-xl border border-[#1CEAB9]/30 bg-black/20 p-4 text-left">
            <div className="text-sm font-semibold text-white">
              Mobile connection
            </div>
            <div className="mt-1 text-xs text-white/70 leading-relaxed">
              On mobile, connect by opening OriginFi inside a Solana wallet browser
              (Phantom / Solflare). Your normal mobile browser usually won’t have a
              wallet extension installed.
            </div>

            <div className="mt-3 grid gap-2">
              <a
                href={phantomBrowse(url)}
                className="w-full text-center rounded-lg border border-[#1CEAB9]/70 bg-black/30 px-4 py-2.5 text-sm font-semibold text-white hover:border-[#1CEAB9]"
              >
                Open in Phantom
              </a>

              <a
                href={solflareBrowse(url)}
                className="w-full text-center rounded-lg border border-[#1CEAB9]/35 bg-black/30 px-4 py-2.5 text-sm font-semibold text-white hover:border-[#1CEAB9]/70"
              >
                Open in Solflare
              </a>
            </div>

            <div className="mt-3 text-[11px] text-white/50">
              After it opens inside the wallet, return here and tap Connect.
            </div>
          </div>
        )}

        {/* 🔑 Show connected wallet address */}
        {connected && publicKey && (
          <div className="w-full text-center">
            <div className="text-xs text-gray-400 mb-1">Connected wallet</div>
            <div className="text-sm text-[#1CEAB9] break-all font-mono">
              {publicKey.toBase58()}
            </div>
          </div>
        )}

        {/* ✅ Standard adapter buttons (desktop + in-wallet mobile) */}
        {connected ? (
          <WalletDisconnectButton className="!bg-[#1CEAB9] !text-black !font-semibold !rounded-lg" />
        ) : (
          <WalletMultiButton className="!bg-[#1CEAB9] !text-black !font-semibold !rounded-lg" />
        )}
      </div>
    </div>
  );
}
