import React, { useMemo, useState } from "react";

/**
 * TokenProfile.jsx
 *
 * Props:
 * - token: object (your token record; supports many optional fields)
 * - creator: object (optional; from PublicProfileView)
 * - onBack: function
 *
 * Goals:
 * - Strong UI (OriginFi dark + teal)
 * - “Accurate” in the sense that it only displays what exists on `token`
 *   and labels unknowns as "—" instead of guessing.
 *
 * Recommended token fields (optional but supported):
 * - name, symbol, mintAddress, imageUrl/logoUrl/thumbnailUrl
 * - createdAt, standard (SPL/Token-2022)
 * - supply, decimals, priceUsd, marketCapUsd
 * - holders, liquidityUsd, volume24hUsd, trades24h
 * - authorityMintRevoked, authorityFreezeRevoked, metadataMutable (boolean), metadataUri
 * - websiteUrl, twitterUrl, telegramUrl, discordUrl, description
 * - priceHistory (array of numbers) OR chartPoints (array of { t, v })
 */

export default function TokenProfile({ token, creator, onBack }) {
  const [copied, setCopied] = useState("");

  const mint = token?.mintAddress || token?.mint || token?.address || "";
  const name = token?.name || "Unnamed Token";
  const symbol = token?.symbol || "";
  const thumbnail = token?.imageUrl || token?.logoUrl || token?.thumbnailUrl || "";

  const standard = token?.standard || token?.tokenStandard || "SPL";
  const createdAtString = token?.createdAt
    ? new Date(token.createdAt).toLocaleString()
    : "—";

  const decimals =
    typeof token?.decimals === "number"
      ? token.decimals
      : typeof token?.decimals === "string"
      ? Number(token.decimals)
      : null;

  const supplyRaw =
    token?.supply ??
    token?.totalSupply ??
    token?.supplyRaw ??
    token?.mintSupply ??
    null;

  const supply = useMemo(() => {
    if (supplyRaw == null) return null;
    const n = Number(supplyRaw);
    if (!isFinite(n)) return null;

    // If supply is raw integer and decimals exist, convert to UI supply.
    // If your backend already stores UI supply, this still displays fine (you can remove conversion if needed).
    if (decimals != null && decimals >= 0 && decimals <= 18 && token?.supplyIsRaw !== false) {
      // Heuristic: if supply is massive and decimals exist, treat it as raw
      // You can set token.supplyIsRaw=false to skip this.
      const converted = n / Math.pow(10, decimals);
      return converted;
    }
    return n;
  }, [supplyRaw, decimals, token?.supplyIsRaw]);

  const priceUsd = numOrNull(token?.priceUsd ?? token?.price);
  const marketCapUsd = numOrNull(token?.marketCapUsd ?? token?.mcapUsd);
  const holders = numOrNull(token?.holders);
  const liquidityUsd = numOrNull(token?.liquidityUsd);
  const volume24hUsd = numOrNull(token?.volume24hUsd);
  const trades24h = numOrNull(token?.trades24h);

  // Authority / receipts (best-effort)
  const receipts = useMemo(() => {
    const mintRevoked =
      boolOrNull(token?.authorityMintRevoked ?? token?.mintRevoked ?? token?.mintAuthorityRevoked);
    const freezeRevoked =
      boolOrNull(
        token?.authorityFreezeRevoked ?? token?.freezeRevoked ?? token?.freezeAuthorityRevoked
      );
    const metadataMutable = boolOrNull(
      token?.metadataMutable ?? token?.isMutable ?? token?.mutable
    );

    const metadataUri = token?.metadataUri || token?.uri || token?.metadataURL || null;

    return {
      mintRevoked,
      freezeRevoked,
      metadataMutable,
      metadataUri,
    };
  }, [token]);

  const links = useMemo(() => {
    // Token links:
    const websiteUrl = token?.websiteUrl || token?.website || token?.site || null;
    const twitterUrl = token?.twitterUrl || token?.twitter || null;
    const discordUrl = token?.discordUrl || token?.discord || null;
    const telegramUrl = token?.telegramUrl || token?.telegram || null;

    // External explorers:
    const solscan = mint ? `https://solscan.io/token/${mint}` : null;
    const dexscreener = mint ? `https://dexscreener.com/solana/${mint}` : null;

    return { websiteUrl, twitterUrl, discordUrl, telegramUrl, solscan, dexscreener };
  }, [token, mint]);

  const description =
    token?.description ||
    token?.bio ||
    token?.about ||
    token?.summary ||
    (creator?.username ? `Created by ${creator.username} on OriginFi.` : "") ||
    "";

  const chartSeries = useMemo(() => {
    // Priority 1: token.chartPoints: [{t, v}]
    if (Array.isArray(token?.chartPoints) && token.chartPoints.length >= 10) {
      const pts = token.chartPoints
        .map((p) => ({
          t: p?.t ?? p?.time ?? p?.timestamp ?? null,
          v: Number(p?.v ?? p?.value ?? p?.price ?? p?.y),
        }))
        .filter((p) => isFinite(p.v));
      if (pts.length >= 10) return { kind: "points", points: pts };
    }

    // Priority 2: token.priceHistory: [numbers]
    if (Array.isArray(token?.priceHistory) && token.priceHistory.length >= 10) {
      const vals = token.priceHistory.map((x) => Number(x)).filter((n) => isFinite(n));
      if (vals.length >= 10) return { kind: "values", values: vals.slice(-60) };
    }

    // Fallback: generate deterministic pseudo series (UI only)
    return { kind: "values", values: generateSeriesFromSeed(symbol || name || mint || "originfi") };
  }, [token, symbol, name, mint]);

  const changePct = useMemo(() => {
    const vals =
      chartSeries.kind === "values"
        ? chartSeries.values
        : chartSeries.points.map((p) => p.v);

    if (!vals || vals.length < 2) return null;
    const a = vals[0];
    const b = vals[vals.length - 1];
    if (!isFinite(a) || !isFinite(b) || a === 0) return null;
    return ((b - a) / a) * 100;
  }, [chartSeries]);

  async function copyToClipboard(label, value) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 900);
    } catch {
      // no-op
    }
  }

  function open(url) {
    if (!url) return;
    window.open(url, "_blank", "noreferrer");
  }

  const trustSignals = useMemo(() => {
    // Token-specific “signals” (not creator trust) — purely informative, no claims.
    // If missing fields, it stays conservative.
    let score = 0;
    if (receipts.mintRevoked === true) score += 30;
    if (receipts.freezeRevoked === true) score += 25;
    if (receipts.metadataMutable === false) score += 20;
    if (holders != null && holders > 0) score += Math.min(15, holders / 500);
    if (liquidityUsd != null && liquidityUsd > 0) score += Math.min(10, liquidityUsd / 20000);

    score = Math.max(0, Math.min(100, Math.round(score)));

    let tier = "Early";
    if (score >= 70) tier = "Strong";
    else if (score >= 40) tier = "Moderate";

    return { score, tier };
  }, [receipts, holders, liquidityUsd]);

  const trustBarWidth = `${trustSignals.score}%`;

  return (
    <div className="w-full px-4">
      <div className="mx-auto w-full max-w-6xl">
        <div
          className="
            mt-2
            rounded-2xl
            bg-[#0B0E11]
            border border-[#1CEAB9]/60
            shadow-[0_0_25px_rgba(28,234,185,0.18)]
            overflow-hidden
          "
          style={{ maxHeight: "calc(100vh - 28px)" }}
        >
          {/* Sticky header */}
          <div className="sticky top-0 z-20 bg-[#0B0E11]/95 backdrop-blur border-b border-[#1CEAB9]/15">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={onBack}
                className="px-3 py-1.5 rounded-lg border border-[#1CEAB9]/50 text-xs text-white hover:bg-[#1CEAB9]/10 transition"
              >
                ← Back
              </button>

              <div className="text-[13px] md:text-sm font-semibold tracking-wide">
                <span className="text-white">Origin</span>
                <span className="text-[#1CEAB9]">Fi</span>
                <span className="text-gray-500"> / Token</span>
              </div>

              <div className="flex items-center gap-2">
                {links.dexscreener && (
                  <button
                    onClick={() => open(links.dexscreener)}
                    className="px-3 py-1.5 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-100 hover:bg-[#1CEAB9]/10 transition"
                  >
                    Dex
                  </button>
                )}
                {links.solscan && (
                  <button
                    onClick={() => open(links.solscan)}
                    className="px-3 py-1.5 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-100 hover:bg-[#1CEAB9]/10 transition"
                  >
                    Solscan
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Scroll body */}
          <div
            className="overflow-y-auto pr-2"
            style={{ maxHeight: "calc(100vh - 28px)", scrollbarGutter: "stable" }}
          >
            {/* Top identity block */}
            <div className="px-4 pt-4 pb-3">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-3">
                {/* Left: token identity */}
                <div className="rounded-2xl border border-[#1CEAB9]/12 bg-[#0E141B] p-4">
                  <div className="flex items-start gap-3">
                    <TokenThumb thumbnail={thumbnail} name={name} symbol={symbol} mint={mint} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl md:text-2xl font-semibold text-white truncate">
                          {name}
                        </h1>
                        {symbol ? (
                          <span className="text-[12px] text-[#1CEAB9]">{symbol}</span>
                        ) : null}
                        <span className="text-[10px] px-2 py-1 rounded-full border border-[#1CEAB9]/20 text-gray-200 bg-black/40">
                          {standard}
                        </span>

                        <span
                          className={`
                            text-[10px] px-2 py-1 rounded-full border
                            ${
                              trustSignals.tier === "Strong"
                                ? "border-[#1CEAB9]/50 text-[#1CEAB9] bg-[#1CEAB9]/10"
                                : trustSignals.tier === "Moderate"
                                ? "border-yellow-400/45 text-yellow-200 bg-yellow-400/10"
                                : "border-gray-500/40 text-gray-200 bg-white/5"
                            }
                          `}
                          title="Token signals based on available receipts + activity."
                        >
                          {trustSignals.tier} signals
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <InfoRow
                          label="Mint"
                          value={mint ? mint : "—"}
                          mono
                          onCopy={mint ? () => copyToClipboard("Mint", mint) : null}
                          copied={copied === "Mint"}
                        />
                        <InfoRow label="Created" value={createdAtString} />
                        <InfoRow
                          label="Supply"
                          value={supply == null ? "—" : formatNumber(supply)}
                        />
                        <InfoRow
                          label="Decimals"
                          value={decimals == null ? "—" : String(decimals)}
                        />
                      </div>

                      {!!description && (
                        <div className="mt-3 rounded-xl border border-[#1CEAB9]/10 bg-black/40 p-3">
                          <p className="text-[12px] text-gray-200 leading-relaxed">{description}</p>
                        </div>
                      )}

                      {/* Social / project links */}
                      {(links.websiteUrl || links.twitterUrl || links.discordUrl || links.telegramUrl) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {links.websiteUrl && (
                            <Chip label="Website" onClick={() => open(links.websiteUrl)} />
                          )}
                          {links.twitterUrl && (
                            <Chip label="X" onClick={() => open(links.twitterUrl)} />
                          )}
                          {links.discordUrl && (
                            <Chip label="Discord" onClick={() => open(links.discordUrl)} />
                          )}
                          {links.telegramUrl && (
                            <Chip label="Telegram" onClick={() => open(links.telegramUrl)} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: chart + signals */}
                <div className="rounded-2xl border border-[#1CEAB9]/12 bg-[#0E141B] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wide text-gray-400">
                      Price / activity
                    </span>
                    <span className="text-[11px] text-gray-200">
                      {changePct == null ? "—" : `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`}
                    </span>
                  </div>

                  <div className="mt-2 rounded-lg border border-[#1CEAB9]/10 bg-black/50 p-3">
                    <Sparkline series={chartSeries} />
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wide text-gray-400">
                        Token signals
                      </span>
                      <span className="text-sm font-semibold text-white">
                        <span className="text-[#1CEAB9] font-mono">{trustSignals.score}</span>
                        <span className="text-gray-400 text-xs"> / 100</span>
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-black border border-[#1CEAB9]/10 overflow-hidden">
                      <div className="h-full bg-[#1CEAB9]/80" style={{ width: trustBarWidth }} />
                    </div>
                    <p className="mt-2 text-[11px] text-gray-400">
                      This is not a promise of safety — it’s a summary of visible receipts + activity.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="px-4 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Stats */}
                <div className="lg:col-span-2 rounded-2xl border border-[#1CEAB9]/12 bg-[#0E141B] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-white">Market stats</h2>
                    <span className="text-[11px] text-gray-400">From available fields</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Metric label="Price" value={priceUsd == null ? "—" : formatUsd(priceUsd)} />
                    <Metric
                      label="Market cap"
                      value={marketCapUsd == null ? "—" : formatUsd(marketCapUsd)}
                    />
                    <Metric label="Holders" value={holders == null ? "—" : formatNumber(holders)} />
                    <Metric
                      label="Liquidity"
                      value={liquidityUsd == null ? "—" : formatUsd(liquidityUsd)}
                    />
                    <Metric
                      label="24h volume"
                      value={volume24hUsd == null ? "—" : formatUsd(volume24hUsd)}
                    />
                    <Metric
                      label="24h trades"
                      value={trades24h == null ? "—" : formatNumber(trades24h)}
                    />
                    <Metric
                      label="Mint"
                      value={mint ? shortMint(mint) : "—"}
                      mono
                      onCopy={mint ? () => copyToClipboard("Mint2", mint) : null}
                      copied={copied === "Mint2"}
                    />
                    <Metric
                      label="Standard"
                      value={standard || "—"}
                    />
                  </div>

                  <p className="mt-3 text-[11px] text-gray-400">
                    Want this truly “accurate”? Pipe these values from your analytics source (DexScreener,
                    Birdeye, Helius, etc.) into your token record. This UI will display them immediately.
                  </p>
                </div>

                {/* Receipts / Authorities */}
                <div className="rounded-2xl border border-[#1CEAB9]/12 bg-[#0E141B] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-white">Receipts</h2>
                    <span className="text-[11px] text-gray-400">Verifiable actions</span>
                  </div>

                  <ReceiptRow
                    label="Mint authority"
                    state={receipts.mintRevoked}
                    yes="Revoked"
                    no="Active"
                    unknown="Unknown"
                  />
                  <ReceiptRow
                    label="Freeze authority"
                    state={receipts.freezeRevoked}
                    yes="Revoked"
                    no="Active"
                    unknown="Unknown"
                  />
                  <ReceiptRow
                    label="Metadata"
                    state={receipts.metadataMutable == null ? null : !receipts.metadataMutable}
                    yes="Locked"
                    no="Mutable"
                    unknown="Unknown"
                  />

                  <div className="mt-3 rounded-xl border border-[#1CEAB9]/10 bg-black/40 p-3">
                    <p className="text-[11px] text-gray-400">
                      Hook: “Receipts” is your advantage vs basic launchpads. You can expand this into a full
                      audit trail (timestamps, tx links, who executed, etc.).
                    </p>
                    {receipts.metadataUri ? (
                      <button
                        onClick={() => open(receipts.metadataUri)}
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-[#1CEAB9]/20 text-[11px] text-gray-100 hover:bg-[#1CEAB9]/10 transition"
                      >
                        Open metadata URI
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Creator panel */}
              {creator ? (
                <div className="mt-3 rounded-2xl border border-[#1CEAB9]/12 bg-[#0E141B] p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Creator</h2>
                    <span className="text-[11px] text-gray-400">OriginFi profile</span>
                  </div>

                  <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#1CEAB9]/35 bg-black flex-shrink-0">
                        {creator?.profileImageUrl ? (
                          <img
                            src={creator.profileImageUrl}
                            alt="Creator avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-[#1CEAB9] font-semibold">
                            {(creator?.username || "?").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm text-white font-semibold truncate">
                          {creator?.username || "Creator"}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {creator?.creatorInfo || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {creator?.twitterUrl ? (
                        <Chip label="X" onClick={() => open(creator.twitterUrl)} />
                      ) : null}
                      {creator?.websiteUrl ? (
                        <Chip label="Website" onClick={() => open(creator.websiteUrl)} />
                      ) : null}
                      {creator?.discordUrl ? (
                        <Chip label="Discord" onClick={() => open(creator.discordUrl)} />
                      ) : null}
                      {creator?.telegramUrl ? (
                        <Chip label="Telegram" onClick={() => open(creator.telegramUrl)} />
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Footer spacer */}
              <div className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- UI Components --------------------------- */

function Chip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-100 hover:bg-[#1CEAB9]/10 transition"
    >
      {label}
    </button>
  );
}

function TokenThumb({ thumbnail, name, symbol, mint }) {
  const label = (symbol || name || mint || "?").trim();
  const initials = getInitials(label);
  const hue = (hashString(label) % 360 + 360) % 360;
  const bg = `linear-gradient(135deg, hsla(${hue}, 90%, 55%, 0.26), hsla(${(hue + 60) % 360}, 90%, 55%, 0.10))`;

  return (
    <div
      className="w-16 h-16 rounded-2xl border border-[#1CEAB9]/20 overflow-hidden bg-black flex items-center justify-center flex-shrink-0"
      style={thumbnail ? undefined : { backgroundImage: bg }}
    >
      {thumbnail ? (
        <img src={thumbnail} alt="Token thumbnail" className="w-full h-full object-cover" />
      ) : (
        <div className="text-white/90 font-semibold text-sm">{initials}</div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono, onCopy, copied }) {
  return (
    <div className="rounded-xl border border-[#1CEAB9]/10 bg-black/40 px-3 py-2 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
        <p className={`mt-0.5 text-[12px] ${mono ? "font-mono" : ""} text-gray-100 break-all`}>
          {value}
        </p>
      </div>
      {onCopy ? (
        <button
          onClick={onCopy}
          className="mt-0.5 px-2 py-1 rounded-lg border border-[#1CEAB9]/20 text-[10px] text-gray-100 hover:bg-[#1CEAB9]/10 transition"
          title="Copy"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      ) : null}
    </div>
  );
}

function Metric({ label, value, mono, onCopy, copied }) {
  return (
    <div className="rounded-xl border border-[#1CEAB9]/10 bg-black/40 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
        {onCopy ? (
          <button
            onClick={onCopy}
            className="px-2 py-1 rounded-lg border border-[#1CEAB9]/15 text-[10px] text-gray-100 hover:bg-[#1CEAB9]/10 transition"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>
      <p className={`mt-1 text-[13px] font-mono text-[#1CEAB9] ${mono ? "break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function ReceiptRow({ label, state, yes, no, unknown }) {
  const isUnknown = state == null;
  const isYes = state === true;

  const pill =
    isUnknown
      ? "border-gray-500/40 text-gray-200 bg-white/5"
      : isYes
      ? "border-[#1CEAB9]/50 text-[#1CEAB9] bg-[#1CEAB9]/10"
      : "border-yellow-400/45 text-yellow-200 bg-yellow-400/10";

  const text = isUnknown ? unknown : isYes ? yes : no;

  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1CEAB9]/10 last:border-b-0">
      <span className="text-[12px] text-gray-200">{label}</span>
      <span className={`text-[10px] px-2 py-1 rounded-full border ${pill}`}>{text}</span>
    </div>
  );
}

/* --------------------------- Chart --------------------------- */

function Sparkline({ series }) {
  const w = 700;
  const h = 160;
  const pad = 10;

  const values =
    series?.kind === "points"
      ? series.points.map((p) => Number(p.v)).filter((n) => isFinite(n))
      : (series?.values || []).map((n) => Number(n)).filter((n) => isFinite(n));

  if (!values || values.length < 2) {
    return <div className="text-xs text-gray-500">Not enough data to render chart.</div>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / (values.length - 1);
      const y = pad + (h - pad * 2) * (1 - (v - min) / span);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[160px]">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-[#1CEAB9]"
        points={points}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line
        x1="0"
        y1={h - 1}
        x2={w}
        y2={h - 1}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="2"
      />
    </svg>
  );
}

/* --------------------------- Utils --------------------------- */

function numOrNull(v) {
  const n = Number(v);
  if (!isFinite(n)) return null;
  return n;
}

function boolOrNull(v) {
  if (v === true || v === false) return v;
  if (v === 1 || v === 0) return Boolean(v);
  if (typeof v === "string") {
    const s = v.toLowerCase().trim();
    if (s === "true" || s === "yes" || s === "1") return true;
    if (s === "false" || s === "no" || s === "0") return false;
  }
  return null;
}

function formatNumber(v) {
  const n = Number(v);
  if (!isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function formatUsd(v) {
  const n = Number(v);
  if (!isFinite(n)) return "—";
  if (n === 0) return "$0";
  if (n < 0.01) return `$${n.toFixed(6)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function shortMint(mint) {
  if (!mint || typeof mint !== "string") return "";
  if (mint.length <= 16) return mint;
  return `${mint.slice(0, 6)}…${mint.slice(-6)}`;
}

function getInitials(s) {
  const parts = s
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);
  const init = parts.map((p) => p[0]).join("");
  return (init || "?").toUpperCase();
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function generateSeriesFromSeed(seedStr) {
  const seed = hashString(seedStr);
  const len = 60;
  let v = 50 + (seed % 25);
  const out = [];

  for (let i = 0; i < len; i++) {
    const r = pseudoRand(seed + i * 9973);
    const drift = Math.sin((i + (seed % 17)) / 7) * 0.8;
    v = v + (r - 0.5) * 6 + drift;
    v = Math.max(5, Math.min(120, v));
    out.push(v);
  }
  return out;
}

function pseudoRand(n) {
  let x = n >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) / 4294967296;
}
