import React from "react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function WalletConnect() {
  const { connected } = useWallet();

  return (
    <div className="bg-[#0B0E11] border border-[#1CEAB9] rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto text-white">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold">Wallet Connection</h2>
        {connected ? (
          <WalletDisconnectButton className="!bg-[#1CEAB9] !text-black !font-semibold !rounded-lg" />
        ) : (
          <WalletMultiButton className="!bg-[#1CEAB9] !text-black !font-semibold !rounded-lg" />
        )}
      </div>
    </div>
  );
}
