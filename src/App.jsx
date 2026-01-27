import React, { useEffect, useMemo, useState } from "react";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

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
import FAQ from "./components/FAQ";
import Docs from "./components/Docs";
import Support from "./components/Support";
import Settings from "./components/Settings";
import Roadmap from "./components/Roadmap";
import WalletConnect from "./components/WalletConnect";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import CreateChoice from "./components/CreateChoice";

import GlassCards from "./components/GlassCards";

export default function App() {
  const [page, setPage] = useState("home");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // 🔐 Token always wins
    if (params.get("token")) {
      setPage("reset");
      return;
    }

    // 🧭 Fallback page navigation
    const p = params.get("page");
    if (p === "forgot") setPage("forgot");
    if (p === "reset") setPage("reset");
  }, []);
  const [network, setNetwork] = useState("mainnet-beta");
  const [theme, setTheme] = useState("dark");

  // ✅ Backend API base (works locally + in production)
  const API_BASE = import.meta.env.VITE_API_URL;
    if (!API_BASE) throw new Error("VITE_API_URL is not set");

  // ✅ Solana RPC endpoint based on selected network
  // (Your Settings page can change this via setNetwork)
  const solanaEndpoint =
    network === "mainnet" || network === "mainnet-beta"
      ? import.meta.env.VITE_SOLANA_RPC
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

  const wallets = useMemo(() => [], []);

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

  const handleProfileClick = async (user) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/protected/public-profile/${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load profile");
      }

      const data = await res.json();

      setSelectedProfile(data.user);
      setPage("profile");
      setSearchResults([]);
      setSearchTerm("");
    } catch (err) {
      console.error("Load profile error:", err);
    }
  };

  const handleBackFromProfile = () => {
    setPage("home");
    setSelectedProfile(null);
  };

  return (
    <ConnectionProvider endpoint={solanaEndpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
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
                            z-[9999]
                            relative
                            pointer-events-auto
                          "
                        >
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            className="
                              w-full text-left
                              flex items-center gap-3
                              px-4 py-2.5
                              hover:bg-white/5
                              cursor-pointer
                            "
                            onClick={() => handleProfileClick(user)}
                          
                          >
                            {/* Avatar */}
                            <div
                              className="
                                w-9 h-9 rounded-full
                                border border-[#1CEAB9]/40
                                bg-[#12161C]
                                flex items-center justify-center
                                overflow-hidden
                                text-xs font-semibold
                                shrink-0
                              "
                            >
                              {user.profileImageUrl ? (
                                <img
                                  src={user.profileImageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[#1CEAB9]">
                                  {(user.username || "?").charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Name + creator level */}
                            <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-medium truncate">
                                {user.username || "No username"}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Creator Level{" "}
                                <span className="text-[#1CEAB9] font-semibold">
                                  {user.creatorLevel?.label || "Newcomer"}
                                </span>
                              </span>
                            </div>
                          </button>
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
                      onClick={() => {
                        const token = localStorage.getItem("originfi_jwt");
                        if (token) setPage("create");
                        else setPage("createChoice");
                      }}
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

              {page === "create" && (() => {
                const token = localStorage.getItem("originfi_jwt");
                const mode = localStorage.getItem("originfi_session_mode"); // "guest" allowed

                // If not logged in AND they didn't choose guest, force the choice screen
                if (!token && mode !== "guest") {
                  return <CreateChoice setPage={setPage} />;
                }

                return <TokenCreationForm />;
              })()}
              {page === "dashboard" && <TokenDashboard />}
              {page === "badges" && <BadgeShowcase />}
              {page === "about" && <About />}
              {page === "community" && <Community />}
              {page === "faq" && <FAQ />}
              {page === "docs" && <Docs />}
              {page === "support" && <Support />}
              {page === "legal" && <TermsPrivacy />}
              {page === "roadmap" && <Roadmap />}
              {page === "forgot" && <ForgotPassword setPage={setPage} />}
              {page === "reset" && <ResetPassword setPage={setPage} />}
              {page === "createChoice" && <CreateChoice setPage={setPage} />}

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
