import React, { useEffect, useMemo, useState } from "react";

// Adjust this path to wherever you put TokenProfile.jsx
import TokenProfile from "./TokenProfile";

/**
 * PublicProfileView (v4)
 * - Reduced dead space near avatar/handle
 * - Badges: brighter surface + colored glow by rarity
 * - Tokens: thumbnail support + click -> TokenProfile.jsx view (keeps file shorter)
 * - Share: works even if you don't have routes by using query params fallback
 */

export default function PublicProfileView({ user, onBack }) {
  if (!user) return null;

  const [isFollowing, setIsFollowing] = useState(false);
  const [localFollowers, setLocalFollowers] = useState(
    typeof user.followersCount === "number" ? user.followersCount : 0
  );

  // When a token is selected, we swap view to TokenProfile.jsx (no routing required)
  const [selectedToken, setSelectedToken] = useState(null);

  const token = localStorage.getItem("originfi_jwt");
  const API = "https://api.originfi.net";

  const {
    id,
    username,
    profileImageUrl,
    bannerImageUrl,
    createdAt,
    badges = [],
    tokens = [],
    bio,
    creatorInfo,
    featuredBadgeIds = [],

    twitterUrl,
    discordUrl,
    websiteUrl,
    telegramUrl,
    followingCount,
  } = user;

  const createdAtString = createdAt ? new Date(createdAt).toLocaleDateString() : null;
  const safeFollowers = localFollowers;
  const safeFollowing = typeof followingCount === "number" ? followingCount : 0;
  const hasAnySocial = twitterUrl || discordUrl || websiteUrl || telegramUrl;

  // If we’re in the token profile view, render TokenProfile and keep the same “Back” behavior
  if (selectedToken) {
    return (
      <TokenProfile
        token={selectedToken}
        creator={user}
        onBack={() => setSelectedToken(null)}
      />
    );
  }

  useEffect(() => {
    if (!id || !token) return;

    fetch(`${API}/api/protected/follow/status/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setIsFollowing(!!data.isFollowing))
      .catch(() => {});
  }, [id, token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleFollow() {
    if (!token) {
      alert("Please log in to follow creators.");
      return;
    }

    const method = isFollowing ? "DELETE" : "POST";
    const res = await fetch(`${API}/api/protected/follow/${id}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.message || "Follow action failed.");
      return;
    }

    setIsFollowing(data.isFollowing);
    if (typeof data.followersCount === "number") setLocalFollowers(data.followersCount);
  }

  // Featured badges: assumes featuredBadgeIds stores badge names
  const displayedBadges =
    Array.isArray(featuredBadgeIds) && featuredBadgeIds.length > 0
      ? (badges || []).filter((b) => b?.name && featuredBadgeIds.includes(b.name))
      : badges || [];

  // Aggregate across tokens (best-effort with your existing fields)
  const aggregate = useMemo(() => {
    return (tokens || []).reduce(
      (acc, t) => {
        const liq = Number(t?.liquidityUsd || 0);
        const vol = Number(t?.volume24hUsd || 0);
        const trades = Number(t?.trades24h || 0);
        const holders = Number(t?.holders || 0);

        return {
          totalLiquidity: acc.totalLiquidity + (isNaN(liq) ? 0 : liq),
          totalVolume24h: acc.totalVolume24h + (isNaN(vol) ? 0 : vol),
          totalTrades24h: acc.totalTrades24h + (isNaN(trades) ? 0 : trades),
          totalHolders: acc.totalHolders + (isNaN(holders) ? 0 : holders),
        };
      },
      { totalLiquidity: 0, totalVolume24h: 0, totalTrades24h: 0, totalHolders: 0 }
    );
  }, [tokens]);

  // Trust Score 0–100 (v1)
  const trust = useMemo(() => {
    const numTokens = (tokens || []).length;
    const numBadges = (badges || []).length;

    const tokenScore = Math.min(numTokens * 6, 30);
    const badgeScore = Math.min(numBadges * 4, 20);
    const holderScore = Math.min(aggregate.totalHolders / 200, 20);
    const liquidityScore = Math.min(aggregate.totalLiquidity / 5000, 15);
    const volumeScore = Math.min(aggregate.totalVolume24h / 15000, 15);

    const raw = tokenScore + badgeScore + holderScore + liquidityScore + volumeScore;
    const score = Math.max(0, Math.min(100, Math.round(raw)));

    let tier = "Low";
    if (score >= 75) tier = "High";
    else if (score >= 45) tier = "Medium";

    return { score, tier };
  }, [tokens, badges, aggregate]);

  const trustBarWidth = `${Math.max(0, Math.min(100, trust.score))}%`;

  const recentTokens = useMemo(() => {
    return [...(tokens || [])]
      .sort((a, b) => {
        const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 10);
  }, [tokens]);

  // Share URL strategy (works even if you don’t have routes)
  const shareUrl = useMemo(() => {
    const origin = window?.location?.origin || "https://originfi.net";
    const path = window?.location?.pathname || "/";
    const qs = new URLSearchParams();
    if (id) qs.set("creatorId", String(id));
    if (username) qs.set("creator", String(username));
    return `${origin}${path}?${qs.toString()}`;
  }, [id, username]);

  async function handleShare() {
    try {
      const urlToCopy = window?.location?.href ? window.location.href : shareUrl;
      await navigator.clipboard.writeText(urlToCopy);
      alert("Profile link copied.");
    } catch {
      alert("Copy failed.");
    }
  }

  function openExternal(url) {
    if (!url) return;
    window.open(url, "_blank", "noreferrer");
  }

  function shortMint(mint) {
    if (!mint || typeof mint !== "string") return "";
    if (mint.length <= 14) return mint;
    return `${mint.slice(0, 6)}…${mint.slice(-6)}`;
  }

  function formatUsd(v) {
    const n = Number(v || 0);
    if (!isFinite(n) || n <= 0) return "—";
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function formatNumber(v) {
    const n = Number(v);
    if (!isFinite(n) || n <= 0) return "—";
    return n.toLocaleString();
  }

  // Badge rarity + glow styling
  function getBadgeRarity(b) {
    const raw = (b?.rarity || b?.tier || b?.level || b?.rank || "").toString().toLowerCase();
    if (["legendary", "mythic"].includes(raw)) return "legendary";
    if (raw === "epic") return "epic";
    if (raw === "rare") return "rare";
    if (raw === "uncommon") return "uncommon";
    if (raw === "common") return "common";

    const name = (b?.name || "").toString().toLowerCase();
    if (name.includes("genesis") || name.includes("founder")) return "legendary";
    if (name.includes("verified") || name.includes("pro")) return "epic";
    if (name.includes("authority") || name.includes("locked")) return "rare";
    return "common";
  }

  const rarity = {
    common: {
      ring: "border-gray-500/35",
      dot: "bg-gray-300",
      name: "text-gray-100",
      sub: "text-gray-300",
      glow: "shadow-none",
      glowStyle: {},
    },
    uncommon: {
      ring: "border-emerald-400/45",
      dot: "bg-emerald-300",
      name: "text-emerald-100",
      sub: "text-gray-200",
      glow: "shadow-[0_0_24px_rgba(52,211,153,0.18)]",
      glowStyle: { boxShadow: "0 0 26px rgba(52,211,153,0.18)" },
    },
    rare: {
      ring: "border-sky-400/45",
      dot: "bg-sky-300",
      name: "text-sky-100",
      sub: "text-gray-200",
      glow: "shadow-[0_0_24px_rgba(56,189,248,0.18)]",
      glowStyle: { boxShadow: "0 0 26px rgba(56,189,248,0.18)" },
    },
    epic: {
      ring: "border-fuchsia-400/45",
      dot: "bg-fuchsia-300",
      name: "text-fuchsia-100",
      sub: "text-gray-200",
      glow: "shadow-[0_0_26px_rgba(232,121,249,0.18)]",
      glowStyle: { boxShadow: "0 0 28px rgba(232,121,249,0.18)" },
    },
    legendary: {
      ring: "border-amber-400/50",
      dot: "bg-amber-300",
      name: "text-amber-100",
      sub: "text-gray-200",
      glow: "shadow-[0_0_28px_rgba(251,191,36,0.20)]",
      glowStyle: { boxShadow: "0 0 30px rgba(251,191,36,0.20)" },
    },
  };

  return (
    <div className="w-full px-4">
      <div className="mx-auto w-full max-w-6xl">
        {/* Card with internal scroll */}
        <div
          className="
            mt-2 rounded-2xl bg-[#0B0E11]
            border border-[#1CEAB9]/60
            shadow-[0_0_25px_rgba(28,234,185,0.18)]
            overflow-hidden
          "
          style={{ maxHeight: "calc(100vh - 28px)" }}
        >
          {/* Sticky top bar */}
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
                <span className="text-gray-500"> / Creator</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFollow}
                  className={`
                    px-3 py-1.5 rounded-full border text-[11px] transition
                    ${
                      isFollowing
                        ? "border-gray-500 text-gray-200 hover:bg-white/5"
                        : "border-[#1CEAB9]/60 text-[#1CEAB9] hover:bg-[#1CEAB9]/10"
                    }
                  `}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="px-3 py-1.5 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
                  title={shareUrl}
                >
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Scroll area */}
          <div
            className="overflow-y-auto pr-2"
            style={{ maxHeight: "calc(100vh - 28px)", scrollbarGutter: "stable" }}
          >
            {/* Banner: shorter to reduce dead space */}
            <div className="relative">
              <div className="w-full h-28 md:h-36 bg-black/40 border-b border-[#1CEAB9]/10 overflow-hidden">
                {bannerImageUrl ? (
                  <img src={bannerImageUrl} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    No banner set
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E11]/85 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Identity section: pulled up + tighter spacing */}
              <div className="px-4 -mt-10 md:-mt-12 pb-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-3">
                  {/* Left */}
                  <div className="rounded-2xl border border-[#1CEAB9]/12 bg-[#0E141B] p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 md:w-18 md:h-18 rounded-full overflow-hidden border border-[#1CEAB9]/70 bg-black flex-shrink-0 shadow-[0_0_18px_rgba(28,234,185,0.18)]">
                        {profileImageUrl ? (
                          <img src={profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-2xl md:text-3xl font-semibold text-[#1CEAB9]">
                            {(username || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-xl md:text-2xl font-semibold text-white leading-tight truncate">
                            {username || "OriginFi Creator"}
                          </h1>

                          <span
                            className={`
                              text-[11px] px-2 py-1 rounded-full border
                              ${
                                trust.tier === "High"
                                  ? "border-[#1CEAB9]/60 text-[#1CEAB9] bg-[#1CEAB9]/10"
                                  : trust.tier === "Medium"
                                  ? "border-yellow-400/55 text-yellow-200 bg-yellow-400/10"
                                  : "border-red-400/55 text-red-200 bg-red-400/10"
                              }
                            `}
                          >
                            {trust.tier} trust
                          </span>
                        </div>

                        <p className="text-[12px] md:text-sm text-gray-200 mt-1">
                          {creatorInfo || "Building on Solana through OriginFi."}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-gray-300">
                          {createdAtString && (
                            <span>
                              Joined{" "}
                              <span className="text-[#1CEAB9] font-mono">{createdAtString}</span>
                            </span>
                          )}
                          <span className="opacity-40">•</span>
                          <span>
                            <span className="text-[#1CEAB9] font-mono">{safeFollowers}</span> Followers
                          </span>
                          <span className="opacity-40">•</span>
                          <span>
                            <span className="text-[#1CEAB9] font-mono">{safeFollowing}</span> Following
                          </span>
                        </div>

                        {hasAnySocial && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {twitterUrl && (
                              <button
                                onClick={() => openExternal(twitterUrl)}
                                className="px-2 py-1 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-100 hover:bg-[#1CEAB9]/10 transition"
                              >
                                X
                              </button>
                            )}
                            {discordUrl && (
                              <button
                                onClick={() => openExternal(discordUrl)}
                                className="px-2 py-1 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-100 hover:bg-[#1CEAB9]/10 transition"
                              >
                                Discord
                              </button>
                            )}
                            {websiteUrl && (
                              <button
                                onClick={() => openExternal(websiteUrl)}
                                className="px-2 py-1 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-100 hover:bg-[#1CEAB9]/10 transition"
                              >
                                Website
                              </button>
                            )}
                            {telegramUrl && (
                              <button
                                onClick={() => openExternal(telegramUrl)}
                                className="px-2 py-1 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-100 hover:bg-[#1CEAB9]/10 transition"
                              >
                                Telegram
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* About (compact, brighter surface) */}
                    <div className="mt-4 rounded-xl border border-[#1CEAB9]/10 bg-black/40 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="text-sm font-semibold text-white">About</h2>
                        <span className="text-[11px] text-gray-400">Public</span>
                      </div>
                      <p className="text-[12px] text-gray-200 leading-relaxed">
                        {bio || "This creator hasn’t added a bio yet."}
                      </p>
                    </div>
                  </div>

                  {/* Right: Trust (more compact) */}
                  <div className="rounded-2xl border border-[#1CEAB9]/12 bg-[#0E141B] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wide text-gray-400">
                        Trust score
                      </span>
                      <span className="text-lg font-semibold text-white">
                        <span className="text-[#1CEAB9] font-mono">{trust.score}</span>
                        <span className="text-gray-400 text-sm"> / 100</span>
                      </span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-black border border-[#1CEAB9]/10 overflow-hidden">
                      <div className="h-full bg-[#1CEAB9]/80" style={{ width: trustBarWidth }} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <MiniMetric label="Launches" value={(tokens || []).length} />
                      <MiniMetric label="Badges" value={(badges || []).length} />
                      <MiniMetric label="Holders" value={formatNumber(aggregate.totalHolders)} />
                      <MiniMetric label="24h Vol" value={formatUsd(aggregate.totalVolume24h)} />
                    </div>

                    <p className="mt-3 text-[11px] text-gray-400">
                      Trust score uses launches, badges, and available on-chain signals.
                    </p>
                  </div>
                </div>

                {/* Badges (brighter + colored glow) */}
                <div className="mt-3 rounded-2xl border border-[#1CEAB9]/12 bg-[#0E141B] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">Badges</h3>
                    <span className="text-[11px] text-gray-400">
                      {displayedBadges.length} shown
                    </span>
                  </div>

                  {displayedBadges.length === 0 ? (
                    <div className="rounded-xl border border-[#1CEAB9]/10 bg-black/40 p-4 text-xs text-gray-300">
                      No badges unlocked yet.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displayedBadges.slice(0, 14).map((b) => {
                        const r = getBadgeRarity(b);
                        const s = rarity[r] || rarity.common;

                        return (
                          <div
                            key={b.name}
                            className={`
                              rounded-xl border ${s.ring} ${s.glow}
                              bg-[#101a23]
                              px-3 py-2
                              hover:bg-[#0f1c26]
                              transition
                            `}
                            style={s.glowStyle}
                            title={b.description ? `${b.name} — ${b.description}` : b.name}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-full border ${s.ring} bg-black flex items-center justify-center text-[12px] ${s.name}`}
                              >
                                {b.icon || "★"}
                              </div>

                              <div className="flex flex-col leading-tight">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] text-white">{b.name}</span>
                                  <span className="flex items-center gap-1 text-[10px] text-gray-300">
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                    {r.toUpperCase()}
                                  </span>
                                </div>
                                <span className={`text-[10px] ${s.sub}`}>
                                  {b.description ? b.description.slice(0, 46) : "Reputation signal"}
                                  {b.description && b.description.length > 46 ? "…" : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Tokens (with thumbnails) */}
                <div className="mt-3 rounded-2xl border border-[#1CEAB9]/12 bg-[#0E141B] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">Tokens</h3>
                    <span className="text-[11px] text-gray-400">{tokens?.length || 0} total</span>
                  </div>

                  {!tokens || tokens.length === 0 ? (
                    <div className="rounded-xl border border-[#1CEAB9]/10 bg-black/40 p-4 text-xs text-gray-300">
                      This creator hasn&apos;t launched any tokens through OriginFi yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recentTokens.map((t) => (
                        <TokenCard
                          key={t?.id || t?.mintAddress || `${Math.random()}`}
                          tokenObj={t}
                          onOpen={() => setSelectedToken(t)}
                          shortMint={shortMint}
                          formatUsd={formatUsd}
                          formatNumber={formatNumber}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI pieces ---------------- */

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-[#1CEAB9]/10 bg-black/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-[12px] font-mono text-[#1CEAB9]">{value}</p>
    </div>
  );
}

function TokenCard({ tokenObj, onOpen, shortMint, formatUsd, formatNumber }) {
  const mint = tokenObj?.mintAddress;
  const name = tokenObj?.name || "Unnamed Token";
  const symbol = tokenObj?.symbol || "";

  const thumbnail =
    tokenObj?.imageUrl || tokenObj?.logoUrl || tokenObj?.thumbnailUrl || "";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="
        w-full text-left
        rounded-xl border border-[#1CEAB9]/12
        bg-[#101a23]
        hover:border-[#1CEAB9]/30
        hover:bg-[#0f1c26]
        transition
        p-3
        flex gap-3
      "
    >
      <TokenThumb thumbnail={thumbnail} name={name} symbol={symbol} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-white truncate">{name}</span>
              {symbol ? <span className="text-[11px] text-[#1CEAB9]">{symbol}</span> : null}
            </div>
            {mint ? (
              <div className="mt-1 text-[11px] text-gray-300 font-mono">{shortMint(mint)}</div>
            ) : (
              <div className="mt-1 text-[11px] text-gray-400">No mint</div>
            )}
          </div>

          <span className="text-[11px] text-gray-300 whitespace-nowrap">
            View
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-[#1CEAB9]/10 bg-black/40 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Holders</p>
            <p className="mt-0.5 text-[12px] font-mono text-[#1CEAB9]">
              {formatNumber(tokenObj?.holders)}
            </p>
          </div>
          <div className="rounded-lg border border-[#1CEAB9]/10 bg-black/40 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">24h Vol</p>
            <p className="mt-0.5 text-[12px] font-mono text-[#1CEAB9]">
              {formatUsd(tokenObj?.volume24hUsd)}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

function TokenThumb({ thumbnail, name, symbol }) {
  const label = (symbol || name || "?").trim();
  const initials = getInitials(label);

  // Deterministic hue based on name/symbol
  const hue = (hashString(label) % 360 + 360) % 360;
  const bg = `linear-gradient(135deg, hsla(${hue}, 90%, 55%, 0.22), hsla(${(hue + 60) % 360}, 90%, 55%, 0.10))`;

  return (
    <div
      className="
        w-14 h-14
        rounded-xl
        border border-[#1CEAB9]/18
        overflow-hidden
        bg-black
        flex items-center justify-center
        flex-shrink-0
      "
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

/* ---------------- small utils ---------------- */

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
