import React from "react";

export default function Settings({ currentNetwork, onNetworkChange, toggleTheme }) {
  return (
    <div className="min-h-screen flex justify-center items-center text-white px-4">
      <div
        className="
          w-full max-w-xl 
          border border-[#1CEAB9] 
          rounded-2xl p-8 
          bg-[#0B0E11] 
          shadow-[0_0_12px_#1CEAB9]
          space-y-6
        "
      >
        <h2 className="text-2xl font-bold text-center">Settings</h2>

        {/* Network Selector */}
        <div>
          <label className="block text-sm mb-2 text-gray-300">Network</label>
          <select
            value={currentNetwork}
            onChange={(e) => onNetworkChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#12161C] border border-[#1CEAB9]/20 focus:ring-2 focus:ring-[#1CEAB9]"
          >
            <option value="devnet">Devnet</option>
            <option value="mainnet-beta">Mainnet</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <div>
          <label className="block text-sm mb-2 text-gray-300">Theme</label>
          <button
            onClick={toggleTheme}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-[#1CEAB9] via-[#17d1a6] to-[#0bc4a1] text-black font-semibold hover:brightness-110 transition"
          >
            Toggle Theme
          </button>
        </div>

        {/* Placeholder for future settings */}
        <div className="text-sm text-gray-400 text-center">
          More settings coming soon...
        </div>
      </div>
    </div>
  );
}
