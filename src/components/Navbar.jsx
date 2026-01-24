import React, { useState } from "react";

export default function Navbar({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: "Home", id: "home" },
    { label: "Create Token", id: "create" },
    { label: "My Tokens / Dashboard", id: "dashboard" },
    { label: "Badge Showcase", id: "badges" },   // ⬅️ NEW
    { label: "Docs", id: "docs" },
    { label: "FAQ", id: "faq" },
    { label: "About", id: "about" },
    { label: "Community", id: "community" },
    { label: "Support / Contact", id: "support" },
    { label: "Wallet Connect", id: "wallet" },
    { label: "Settings", id: "settings" },
    { label: "Roadmap", id: "roadmap" },
    { label: "Terms & Privacy", id: "legal" },
  ];

  const handleClick = (id) => {
    setMenuOpen(false);

    // Special handling for Create Token
    if (id === "create") {
      const token = localStorage.getItem("originfi_jwt");

      if (onNavigate) {
        if (token) {
          onNavigate("create");        // logged in → go straight to create
        } else {
          onNavigate("createChoice");  // guest → show choice screen
        }
      }
      return;
    }

    // All other menu items behave normally
    if (onNavigate) onNavigate(id);
  };

  return (
    <>
      {/* Hamburger Button */}
      <div className="absolute top-4 left-4 z-40">
        <button
          className="text-[28px] font-bold text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Side Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#0B0E11] shadow-lg transform transition-transform duration-300 z-50 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          className="text-white text-3xl p-3 focus:outline-none"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          &times;
        </button>

        {/* Branding */}
        <div className="text-2xl font-bold text-white px-6 mb-4 tracking-wide">
          <span className="text-[#1CEAB9]">Origin</span>
          <span className="text-[#3CA7F5]">Fi</span>
        </div>

        {/* Divider */}
        <div className="h-[2px] w-2/3 mx-6 bg-gradient-to-r from-[#1CEAB9] to-[#3CA7F5] rounded-full mb-3" />

        {/* Nav Links */}
        <nav className="flex flex-col space-y-3 px-6 text-white font-medium text-base">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className="text-left hover:text-[#1CEAB9] transition duration-200 hover:pl-1 focus:outline-none"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer Branding */}
        <div className="absolute bottom-4 left-6 text-xs text-gray-500">
          Powered by Solana
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
