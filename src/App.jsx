import React, { useState, useMemo } from "react";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import Background from "./components/Background";
import Background2 from "./components/Background2";
import TopRightProfile from "./components/TopRightProfile";
import Navbar from "./components/Navbar";
import TokenDashboard from "./components/TokenDashboard";
import PublicProfileView from "./components/PublicProfileView";
import TokenCreationForm from "./components/TokenCreationForm";
import BadgeShowcase from "./components/BadgeShowcase";
import About from "./components/About";
import Community from "./components/Community";
import TermsPrivacy from "./components/TermsPrivacy";
import Settings from "./components/Settings";
import Roadmap from "./components/Roadmap";
import WalletConnect from "./components/WalletConnect";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

import GlassCards from "./components/GlassCards";

export default function App() {
  const [page, setPage] = useState("home");
  const [network, setNetwork] = useState("devnet");
  const [theme, setTheme] = useState("dark");

  // ✅ Backend API base (works locally + in production)
  const API_BASE = import.meta.env.VITE_API_URL;
    if (!API_BASE) throw new Error("VITE_API_URL is not set");

  // ✅ Solana RPC endpoint based on selected network
  // (Your Settings page can change this via setNetwork)
  const solanaEndpoint =
    network === "mainnet" || network === "mainnet-beta"
      ? "https://api.mainnet-beta.solana.com"
      : network === "testnet"
      ? "https://api.testnet.solana.com"
      : "https://api.devnet.solana.com";

  // 🔍 Profile search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // 👤 Selected profile for profile page
  const [selectedProfile, setSelectedProfile] = useState(null);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "alt" : "dark"));
  };

  // 🔍 Search handler for the home search bar
  const handleProfileSearch = async (e) => {
    e.preventDefault();

    const q = searchTerm.trim();
    if (!q) return;

    try {
      setSearchLoading(true);
      setSearchError("");
      setSearchResults([]);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/protected/profile-search?q=${encodeURIComponent(q)}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Server error while searching profiles.");
      }

      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Profile search error:", err);
      setSearchError(err.message || "Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProfileClick = (user) => {
    console.log("Clicked user:", user);
    setSelectedProfile(user);
    setPage("profile");
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleBackFromProfile = () => {
    setPage("home");
    setSelectedProfile(null);
  };

  return (
    <ConnectionProvider endpoint={solanaEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="relative min-h-screen font-poppins overflow-hidden text-white">
            {/* Background based on theme */}
            {theme === "dark" ? <Background /> : <Background2 />}

            <Navbar onNavigate={setPage} />
            <TopRightProfile setPage={setPage} />

            <main className="relative z-10 flex flex-col items-center justify-center flex-grow px-8 text-center max-w-[1400px] mx-auto min-h-screen">
              {/* HOME PAGE */}
              {page === "home" && (
                <div className="pt-40 flex flex-col items-center">
                  {/* 🔍 Profile Search Bar (at top, independent of hero) */}
                  <div className="absolute top-4 w-full flex justify-center px-4 z-20">
                    <div className="w-full max-w-3xl">
                      <form
                        onSubmit={handleProfileSearch}
                        className="
                          w-full
                          flex items-center gap-3
                          px-5 py-3
                          rounded-3xl
                          bg-[rgba(20,20,20,0.55)]
                          border border-white/10
                          backdrop-blur-xl
                          shadow-[0_0_25px_rgba(0,0,0,0.5)]
                        "
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="#ffffff"
                          className="w-5 h-5 opacity-80"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
                          />
                        </svg>

                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search OriginFi profiles..."
                          className="
                            flex-1
                            bg-transparent
                            text-white
                            placeholder:text-white/40
                            text-base
                            focus:outline-none
                          "
                        />

                        <button
                          type="submit"
                          className="
                            hidden sm:inline-flex
                            px-3 py-1.5
                            rounded-2xl
                            border border-[#1CEAB9]/70
                            text-[11px]
                            font-medium tracking-wide
                            uppercase
                            text-[#1CEAB9]
                            hover:bg-[#1CEAB9]/10
                            transition
                          "
                        >
                          Search
                        </button>
                      </form>

                      {/* 🔍 Results / status under the bar */}
                      {searchLoading && (
                        <div className="mt-2 text-xs text-left text-slate-300">
                          Searching...
                        </div>
                      )}

                      {searchError && (
                        <div className="mt-2 text-xs text-left text-red-400">
                          {searchError}
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div
                          className="
                            mt-2
                            w-full
                            rounded-2xl
                            bg-[rgba(5,7,10,0.95)]
                            border border-white/10
                            backdrop-blur-xl
                            text-left
                            text-sm
                            max-h-64
                            overflow-y-auto
                          "
                        >
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              className="
                                flex items-center gap-3
                                px-4 py-2.5
                                hover:bg-white/5
                                cursor-pointer
                              "
                              onClick={() => handleProfileClick(user)}
                            >
                              {/* avatar circle */}
                              <div
                                className="
                                  w-8 h-8 rounded-full
                                  bg-gradient-to-br from-[#1CEAB9] to-[#0B7285]
                                  flex items-center justify-center
                                  text-xs font-semibold
                                "
                              >
                                {(user.username || user.email || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="flex flex-col">
                                <span className="text-[13px] font-medium">
                                  {user.username || "No username"}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hero content (unchanged position) */}
                  <h1
                    className="text-7xl font-extrabold select-none"
                    style={{ letterSpacing: "0.05em", textTransform: "none" }}
                  >
                    Origin
                    <span className="text-[#1CEAB9]">Fi</span>
                  </h1>

                  <p className="mt-4 text-xl md:text-2xl text-[#1CEAB9] italic opacity-70">
                    Purpose. Power. Performance.
                  </p>

                  <div className="mt-8 flex flex-col items-center w-full max-w-3xl px-4">
                    <button
                      onClick={() => setPage("create")}
                      className="
                        mb-0
                        px-8 py-3
                        border-2 border-[#1CEAB9]
                        bg-black text-white font-semibold rounded-lg
                        cursor-pointer
                        transform transition duration-300
                        hover:scale-105
                        hover:shadow-[0_0_15px_#1CEAB9]
                        focus:outline-none
                        self-center
                      "
                    >
                      Start Now
                    </button>

                    <div className="-mt-16">
                      <GlassCards />
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE PAGE */}
              {page === "profile" && selectedProfile && (
                <PublicProfileView
                  user={selectedProfile}
                  onBack={handleBackFromProfile}
                />
              )}

              {page === "create" && <TokenCreationForm />}
              {page === "dashboard" && <TokenDashboard />}
              {page === "badges" && <BadgeShowcase />}
              {page === "about" && <About />}
              {page === "community" && <Community />}
              {page === "legal" && <TermsPrivacy />}
              {page === "roadmap" && <Roadmap />}
              {page === "forgot" && <ForgotPassword setPage={setPage} />}
              {page === "reset" && <ResetPassword setPage={setPage} />}

              {page === "settings" && (
                <Settings
                  currentNetwork={network}
                  onNetworkChange={setNetwork}
                  toggleTheme={toggleTheme}
                />
              )}
              {page === "wallet" && <WalletConnect />}
            </main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
