// src/components/TokenAnalyticsDetailPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaExternalLinkAlt, FaChartLine, FaDollarSign, FaWater, FaExchangeAlt, FaBolt } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Props:
 *  - token: a token object from /api/token/mine (must have mintAddress, name, symbol, etc.)
 *  - onBack: function to call when user clicks "Back"
 */
export default function TokenAnalyticsDetailPanel({ token, onBack }) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [dexData, setDexData] = useState(null);

  useEffect(() => {
    if (!token?.mintAddress) {
      setErrorMsg("No token selected.");
      setLoading(false);
      return;
    }

    async function fetchAnalytics() {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch(
          `${API_BASE}/api/token/analytics/${token.mintAddress}`
        );
        const data = await res.json();
        console.log("Analytics detail response:", data);

        if (!res.ok || data.ok === false) {
          setErrorMsg(data.error || "Failed to load analytics.");
          return;
        }

        // Dexscreener raw object is in data.data
        if (!data.data || !data.data.pairs || !Array.isArray(data.data.pairs)) {
          setErrorMsg(
            "No on-chain market data detected for this token yet (no DEX liquidity)."
          );
          setDexData(null);
          return;
        }

        setDexData(data.data);
      } catch (err) {
        console.error("Error fetching analytics detail:", err);
        setErrorMsg("Unexpected error loading analytics.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [token?.mintAddress]);

  const pairs = dexData?.pairs ?? [];

  // Choose a "primary" pair – highest liquidity, preferring Raydium if tied
  const primaryPair = useMemo(() => {
    if (!pairs.length) return null;

    return pairs.reduce((best, p) => {
      const bestLiq = Number(best.liquidity?.usd || 0);
      const liq = Number(p.liquidity?.usd || 0);

      // Prefer Raydium when liquidity is similar
      const isRaydium = p.dexId === "raydium";
      const bestIsRaydium = best.dexId === "raydium";

      if (!best) return p;
      if (liq > bestLiq) return p;
      if (liq === bestLiq) {
        if (isRaydium && !bestIsRaydium) return p;
      }
      return best;
    }, pairs[0]);
  }, [pairs]);

  const priceUsd = primaryPair?.priceUsd
    ? Number(primaryPair.priceUsd)
    : null;
  const liqUsd = primaryPair?.liquidity?.usd
    ? Number(primaryPair.liquidity.usd)
    : null;
  const vol24h = primaryPair?.volume?.h24
    ? Number(primaryPair.volume.h24)
    : null;
  const mcap = primaryPair?.marketCap
    ? Number(primaryPair.marketCap)
    : null;
  const fdv = primaryPair?.fdv ? Number(primaryPair.fdv) : null;

  const buys24h = primaryPair?.txns?.h24?.buys ?? null;
  const sells24h = primaryPair?.txns?.h24?.sells ?? null;
  const tx24h =
    buys24h != null && sells24h != null ? buys24h + sells24h : null;

  const change24h =
    primaryPair?.priceChange?.h24 != null
      ? Number(primaryPair.priceChange.h24)
      : null;

  const dexLabel = primaryPair?.dexId
    ? primaryPair.dexId.charAt(0).toUpperCase() + primaryPair.dexId.slice(1)
    : "Unknown";

  const chartEmbedUrl = primaryPair
    ? `https://dexscreener.com/solana/${primaryPair.pairAddress}?embed=1&theme=dark&trades=0&info=0`
    : null;

  // Premium Dark number formatting helper
  const fmt = (n, digits = 2) => {
    if (n == null || isNaN(n)) return "-";
    if (Math.abs(n) >= 1_000_000_000) {
      return (n / 1_000_000_000).toFixed(digits) + "B";
    }
    if (Math.abs(n) >= 1_000_000) {
      return (n / 1_000_000).toFixed(digits) + "M";
    }
    if (Math.abs(n) >= 1_000) {
      return (n / 1_000).toFixed(digits) + "K";
    }
    return n.toFixed(digits);
  };

  const pctClass =
    change24h == null
      ? "text-gray-400"
      : change24h > 0
      ? "text-emerald-400"
      : change24h < 0
      ? "text-red-400"
      : "text-gray-400";

  if (!token) {
    return (
      <div className="flex flex-col h-full text-gray-300 text-sm">
        <div className="mb-4 flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#1CEAB9]/60 text-xs text-[#1CEAB9] hover:bg-[#10221d] transition"
            onClick={onBack}
          >
            <FaArrowLeft />
            Back
          </button>
        </div>
        <div>No token selected.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-gray-100">
      {/* Top bar with Back + title */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#1CEAB9]/60 text-xs text-[#1CEAB9] hover:bg-[#10221d] transition"
          onClick={onBack}
        >
          <FaArrowLeft />
          Back to Tokens
        </button>

        <div className="text-xs text-gray-400">
          Live market analytics powered by{" "}
          <span className="text-[#1CEAB9] font-semibold">DexScreener</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col gap-4 h-full overflow-hidden">
        {/* HERO HEADER + KEY STATS GRID */}
        <div className="grid grid-cols-12 gap-4">
          {/* Hero token header (left) */}
          <div className="col-span-12 lg:col-span-4">
            <div className="h-full rounded-2xl border border-[#1CEAB9]/30 bg-gradient-to-br from-[#0B0E11] to-[#050608] p-4 shadow-[0_0_25px_rgba(0,0,0,0.7)]">
              <div className="flex items-center gap-4 mb-3">
                {/* Fake logo circle (you can replace with real image later) */}
                <div className="w-12 h-12 rounded-full bg-[#121619] border border-[#1CEAB9]/50 flex items-center justify-center text-lg font-bold">
                  {token.symbol?.[0] || "T"}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">
                    {token.name}{" "}
                    <span className="text-xs ml-2 px-2 py-1 rounded-full border border-[#1CEAB9]/50 text-[#1CEAB9]">
                      {token.symbol}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Mint:
                    <span className="ml-1 break-all">
                      {token.mintAddress}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Network: {token.network?.toUpperCase() || "UNKNOWN"}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-[11px] text-gray-400">
                <div>
                  Owner Wallet:
                  <span className="ml-1 break-all text-gray-300">
                    {token.ownerWallet}
                  </span>
                </div>
                <div>
                  Initial Supply:
                  <span className="ml-1 text-gray-200">
                    {token.initialSupply}
                  </span>
                </div>
                <div>
                  Decimals:
                  <span className="ml-1 text-gray-200">{token.decimals}</span>
                </div>
                {primaryPair?.url && (
                  <div className="pt-2">
                    <a
                      href={primaryPair.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#1CEAB9] hover:text-[#7fffe0]"
                    >
                      View on DexScreener
                      <FaExternalLinkAlt className="text-[9px]" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key stats (right) */}
          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-full">
              {/* Price */}
              <StatCard
                icon={<FaDollarSign />}
                label="Price (USD)"
                value={
                  priceUsd != null ? `$${priceUsd.toFixed(4)}` : "No liquidity"
                }
                subValue={
                  change24h != null
                    ? `${change24h > 0 ? "+" : ""}${change24h.toFixed(
                        2
                      )}% (24h)`
                    : "–"
                }
                valueClass={pctClass}
              />

              {/* Liquidity */}
              <StatCard
                icon={<FaWater />}
                label="Liquidity (USD)"
                value={liqUsd != null ? `$${fmt(liqUsd)}` : "No pool"}
                subValue={dexLabel}
              />

              {/* Volume 24h */}
              <StatCard
                icon={<FaChartLine />}
                label="Volume (24h)"
                value={vol24h != null ? `$${fmt(vol24h)}` : "–"}
                subValue={tx24h != null ? `${tx24h} trades` : "No volume"}
              />

              {/* Market Cap */}
              <StatCard
                icon={<FaExchangeAlt />}
                label="Market Cap"
                value={mcap != null ? `$${fmt(mcap)}` : "–"}
                subValue={fdv != null ? `FDV: $${fmt(fdv)}` : ""}
              />

              {/* Buys / Sells 24h */}
              <StatCard
                icon={<FaBolt />}
                label="Order Flow (24h)"
                value={
                  buys24h != null && sells24h != null
                    ? `${buys24h} buys / ${sells24h} sells`
                    : "–"
                }
                subValue={
                  tx24h != null
                    ? `${tx24h} total on main pair`
                    : "Waiting for trades"
                }
              />

              {/* Extra slot or placeholder */}
              <StatCard
                icon={<FaChartLine />}
                label="Analytics Source"
                value={dexData ? "DexScreener" : "No DEX data"}
                subValue={primaryPair?.dexId || "–"}
              />
            </div>
          </div>
        </div>

        {/* LOADING / ERROR STATES */}
        {loading && (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-300">
            Loading live market analytics...
          </div>
        )}

        {!loading && errorMsg && (
          <div className="flex-1 flex items-center justify-center text-sm text-red-300">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && !primaryPair && (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-300">
            No DEX liquidity or markets detected yet for this token. Once
            liquidity is added on Raydium/Orca/Meteora, analytics will
            appear here automatically.
          </div>
        )}

        {/* MAIN CONTENT BELOW: CHART + POOL GRID */}
        {!loading && !errorMsg && primaryPair && (
          <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
            {/* Chart */}
            <div className="col-span-12 lg:col-span-7 flex flex-col min-h-[260px]">
              <div className="rounded-2xl border border-[#1CEAB9]/30 bg-gradient-to-br from-[#050608] to-[#0B0E11] p-3 h-full shadow-[0_0_25px_rgba(0,0,0,0.7)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <FaChartLine className="text-[#1CEAB9]" />
                    Price & Liquidity Chart
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Primary Pool:{" "}
                    <span className="text-[#1CEAB9]">
                      {dexLabel} · {primaryPair.pairAddress.slice(0, 6)}...
                      {primaryPair.pairAddress.slice(-4)}
                    </span>
                  </div>
                </div>

                {chartEmbedUrl ? (
                  <iframe
                    title="DexScreener Chart"
                    src={chartEmbedUrl}
                    className="w-full h-full rounded-xl border border-[#1CEAB9]/20"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-gray-400">
                    Chart unavailable for this pair.
                  </div>
                )}
              </div>
            </div>

            {/* Pool list */}
            <div className="col-span-12 lg:col-span-5 flex flex-col min-h-[260px]">
              <div className="rounded-2xl border border-[#1CEAB9]/30 bg-gradient-to-br from-[#050608] to-[#0B0E11] p-3 h-full shadow-[0_0_25px_rgba(0,0,0,0.7)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <FaExchangeAlt className="text-[#1CEAB9]" />
                    Liquidity Pools
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {pairs.length} pool{pairs.length !== 1 ? "s" : ""} found
                  </div>
                </div>

                <div className="space-y-2 overflow-y-auto pr-1 custom-scroll">
                  {pairs.map((p, i) => {
                    const liq = p.liquidity?.usd
                      ? Number(p.liquidity.usd)
                      : null;
                    const vol = p.volume?.h24
                      ? Number(p.volume.h24)
                      : null;
                    const buys = p.txns?.h24?.buys ?? null;
                    const sells = p.txns?.h24?.sells ?? null;

                    const label =
                      p.labels && p.labels.length
                        ? p.labels.join(" · ").toUpperCase()
                        : "";

                    return (
                      <div
                        key={`${p.pairAddress}-${i}`}
                        className={`rounded-xl border ${
                          p.pairAddress === primaryPair.pairAddress
                            ? "border-[#1CEAB9]"
                            : "border-[#1CEAB9]/20"
                        } bg-[#06090c] px-3 py-2 text-xs flex flex-col gap-1 hover:border-[#1CEAB9]/70 transition`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-[#1CEAB9]/10 text-[#1CEAB9] text-[10px] font-semibold uppercase">
                              {p.dexId}
                            </span>
                            {label && (
                              <span className="px-2 py-0.5 rounded-full bg-[#ffffff0b] text-[10px] text-gray-300 uppercase">
                                {label}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {p.pairAddress.slice(0, 5)}...
                            {p.pairAddress.slice(-4)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <div>
                            <div className="text-[11px] text-gray-400">
                              Price
                            </div>
                            <div className="text-[12px] text-white">
                              {p.priceUsd
                                ? `$${Number(p.priceUsd).toFixed(5)}`
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-gray-400">
                              Liquidity
                            </div>
                            <div className="text-[12px] text-white">
                              {liq != null ? `$${fmt(liq)}` : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-gray-400">
                              Vol (24h)
                            </div>
                            <div className="text-[12px] text-white">
                              {vol != null ? `$${fmt(vol)}` : "-"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <div className="text-[11px] text-gray-400">
                            {buys != null && sells != null
                              ? `${buys} buys / ${sells} sells (24h)`
                              : "No trades yet"}
                          </div>
                          {p.url && (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#1CEAB9] hover:text-[#7fffe0]"
                            >
                              Open
                              <FaExternalLinkAlt className="text-[9px]" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optional tiny CSS for slim scrollbars, if you want */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #1ceab955;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, valueClass }) {
  return (
    <div className="rounded-2xl border border-[#1CEAB9]/25 bg-gradient-to-br from-[#050608] to-[#0B0E11] p-3 flex flex-col justify-between shadow-[0_0_20px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wide text-gray-400">
          {label}
        </span>
        <span className="text-xs text-[#1CEAB9] opacity-80">{icon}</span>
      </div>
      <div
        className={`text-sm font-semibold text-white ${
          valueClass ? valueClass : ""
        }`}
      >
        {value}
      </div>
      {subValue && (
        <div className="text-[11px] text-gray-500 mt-1 truncate">
          {subValue}
        </div>
      )}
    </div>
  );
}
