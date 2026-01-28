import React from "react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

function getCurrentUrl() {
  try {
    return window.location.href;
  } catch {
    return "https://originfi.net";
  }
}

// Deep links: open your current page inside wallet browsers
function phantomBrowse(url) {
  return `https://phantom.app/ul/browse/${encodeURIComponent(url)}?ref=originfi`;
}

function solflareBrowse(url) {
  return `https://solflare.com/ul/v1/browse?url=${encodeURIComponent(url)}`;
}

export default function WalletConnectMobile() {
  const { connected, publicKey } = useWallet();
  const url = getCurrentUrl();

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="bg-[#0B0E11] border border-[#1CEAB9] rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto text-white">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-bold">Wallet Connection</h2>

          {/* Mobile-specific flow */}
          {!connected && (
            <>
              <div className="w-full text-center text-sm text-white/70">
                On mobile, connect inside your wallet browser (Phantom / Solflare).
              </div>

              <div className="w-full grid gap-2">
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

              <div className="w-full text-center text-xs text-white/55">
                If you are already inside the wallet browser, tap Connect below.
              </div>
            </>
          )}

          {/* Show connected wallet address (same as your desktop design) */}
          {connected && publicKey && (
            <div className="w-full text-center">
              <div className="text-xs text-gray-400 mb-1">Connected wallet</div>
              <div className="text-sm text-[#1CEAB9] break-all font-mono">
                {publicKey.toBase58()}
              </div>
            </div>
          )}

          {/* Keep your same button styling */}
          {connected ? (
            <WalletDisconnectButton className="!bg-[#1CEAB9] !text-black !font-semibold !rounded-lg !w-full" />
          ) : (
            <WalletMultiButton className="!bg-[#1CEAB9] !text-black !font-semibold !rounded-lg !w-full" />
          )}
        </div>
      </div>
    </div>
  );
}
