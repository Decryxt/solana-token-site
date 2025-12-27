// src/components/TokenAnalyticsPanel.jsx
import React, { useEffect, useState, useMemo } from "react";
import { getAuth } from "../authStorage";
import { FaSearch } from "react-icons/fa";
import TokenAnalyticsDetailPanel from "./TokenAnalyticsDetailPanel";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function TokenAnalyticsPanel() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [selectedToken, setSelectedToken] = useState(null);
  const [view, setView] = useState("list"); // "list" | "detail"
  const [innerFade, setInnerFade] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const token = auth?.token;

    if (!token) {
      setErrorMsg("You must be logged in to view token analytics.");
      setLoading(false);
      return;
    }

    async function fetchTokens() {
      try {
        const res = await fetch(`${API_BASE}/api/token/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("Token analytics /mine:", data);

        if (!res.ok || data.ok === false) {
          setErrorMsg(data.error || "Failed to load token analytics.");
          return;
        }

        setTokens(data.tokens || []);
      } catch (err) {
        console.error("Error fetching /api/token/mine:", err);
        setErrorMsg("Unexpected error loading token analytics.");
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, []);

  const filteredTokens = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) => {
      const name = (t.name || "").toLowerCase();
      const symbol = (t.symbol || "").toLowerCase();
      const mint = (t.mintAddress || "").toLowerCase();
      return (
        name.includes(q) ||
        symbol.includes(q) ||
        mint.includes(q)
      );
    });
  }, [tokens, search]);

  if (loading) {
    return (
      <div className="text-sm text-gray-300">
        Loading token analytics...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-sm text-red-300">
        {errorMsg}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-sm text-gray-300">
        You haven&apos;t created any tokens yet.
      </div>
    );
  }

  const formatPrice = (t) => {
    const raw =
      t.priceUsd ??
      t.priceUSD ??
      t.price ??
      null;

    if (raw == null || isNaN(Number(raw))) return "—";
    const num = Number(raw);
    if (num === 0) return "$0.00";
    if (num < 0.0001) return "<$0.0001";
    return `$${num.toFixed(4)}`;
  };

  const formatSupplyShort = (t) => {
    const supply = Number(t.initialSupply || "0");
    if (!isNaN(supply) && supply > 0) {
      if (supply >= 1_000_000_000) return (supply / 1_000_000_000).toFixed(2) + "B";
      if (supply >= 1_000_000) return (supply / 1_000_000).toFixed(2) + "M";
      if (supply >= 1_000) return (supply / 1_000).toFixed(2) + "K";
      return supply.toString();
    }
    return "—";
  };

  const getImageUrl = (t) => {
    return (
      t.imageURI ||
      t.imageUrl ||
      t.image ||
      null
    );
  };

  const goToDetailView = (token) => {
    setInnerFade(true);
    setTimeout(() => {
      setSelectedToken(token);
      setView("detail");
      setInnerFade(false);
    }, 250);
  };

  const backToListView = () => {
    setInnerFade(true);
    setTimeout(() => {
      setView("list");
      setSelectedToken(null);
      setInnerFade(false);
    }, 250);
  };

  return (
    <div
      className={`flex flex-col h-full text-sm text-gray-200 space-y-4 transition-opacity duration-300 ${
        innerFade ? "opacity-0" : "opacity-100"
      }`}
    >
      {view === "list" && (
        <>
          {/* Search bar */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wide text-gray-400">
                Your Tokens
              </span>
              <span className="text-[10px] text-gray-500">
                ({tokens.length} total)
              </span>
            </div>
            <div className="flex items-center bg-[#0B0E11] border border-[#1CEAB9]/40 rounded-full px-3 py-2">
              <FaSearch className="text-xs text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search by name, symbol, or mint address..."
                className="bg-transparent flex-1 text-xs outline-none text-gray-200 placeholder:text-gray-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List header */}
          <div className="hidden md:grid grid-cols-[2.5rem,1.6fr,0.8fr,0.8fr,0.7fr] text-[10px] uppercase tracking-wide text-gray-500 px-2">
            <div></div>
            <div>Name</div>
            <div>Symbol</div>
            <div>Price</div>
            <div>Supply</div>
          </div>

          {/* Token list */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-[#1CEAB9]/30 bg-[#050709]">
            {filteredTokens.length === 0 && (
              <div className="p-4 text-xs text-gray-400">
                No tokens match &quot;{search}&quot;.
              </div>
            )}

            {filteredTokens.map((t) => {
              const imageUrl = getImageUrl(t);

              return (
                <button
                  key={t.id || t.mintAddress}
                  type="button"
                  onClick={() => goToDetailView(t)}
                  className="w-full flex items-center px-3 py-2 md:py-2.5 border-b border-[#1CEAB9]/10 text-left text-xs md:text-sm transition-colors bg-transparent hover:bg-[#050f10]"
                >
                  {/* Image / avatar */}
                  <div className="w-10 flex-shrink-0 flex items-center justify-center mr-2">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={t.name || t.symbol || "Token"}
                        className="w-8 h-8 rounded-full object-cover border border-[#1CEAB9]/60"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#0B0E11] border border-[#1CEAB9]/40 flex items-center justify-center text-[10px] text-gray-300">
                        {(t.symbol || t.name || "?")
                          .toString()
                          .slice(0, 3)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 flex flex-col md:grid md:grid-cols-[1.6fr,0.8fr,0.8fr,0.7fr] md:gap-2">
                    {/* Name + mint snippet */}
                    <div className="flex flex-col">
                      <div className="font-semibold text-white truncate">
                        {t.name || "Unnamed Token"}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        Mint: {t.mintAddress}
                      </div>
                    </div>

                    {/* Symbol */}
                    <div className="hidden md:flex items-center text-gray-200">
                      <span className="truncate">{t.symbol || "—"}</span>
                    </div>

                    {/* Price */}
                    <div className="hidden md:flex items-center">
                      <span className="truncate text-gray-200">
                        {formatPrice(t)}
                      </span>
                    </div>

                    {/* Supply / network */}
                    <div className="hidden md:flex items-center justify-between">
                      <span className="truncate text-gray-200">
                        {formatSupplyShort(t)}
                      </span>
                      <span className="ml-2 text-[10px] uppercase text-gray-500">
                        {(t.network || "").toString().toUpperCase() || "SOL"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {view === "detail" && selectedToken && (
        <TokenAnalyticsDetailPanel
          token={selectedToken}
          onBack={backToListView}
        />
      )}
    </div>
  );
}
