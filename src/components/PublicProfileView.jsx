import React, { useEffect, useMemo, useState } from "react";

/**
 * PublicProfileView (SOCIAL PROFILE + TOKEN PROFILE MODAL)
 *
 * What you asked for:
 * 1) Badge rarity colors (not dull gray) ✅
 * 2) Click a token on the profile -> opens a "token profile" template (modal) with:
 *    - detail sections
 *    - chart area (sparkline placeholder that can use token.priceHistory if you add it later)
 *    - all the numbers/details ✅
 * 3) Share profile: if your site isn’t route-based, don’t rely on /profile/:id.
 *    This uses a safe approach:
 *    - copy current URL if possible
 *    - else copy a generated "share URL" with query params (?creator=...) ✅
 *
 * Notes:
 * - No backend changes required.
 * - If you later add real time-series data (priceHistory), the chart will automatically use it.
 */

export default function PublicProfileView({ user, onBack }) {
  if (!user) return null;

  const [isFollowing, setIsFollowing] = useState(false);
  const [localFollowers, setLocalFollowers] = useState(
    typeof user.followersCount === "number" ? user.followersCount : 0
  );
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

  // Featured badges: currently assumes featuredBadgeIds stores badge names
  const displayedBadges =
    Array.isArray(featuredBadgeIds) && featuredBadgeIds.length > 0
      ? (badges || []).filter((b) => b?.name && featuredBadgeIds.includes(b.name))
      : badges || [];

  // Aggregate across tokens (best-effort with your existing placeholder fields)
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
      {
        totalLiquidity: 0,
        totalVolume24h: 0,
        totalTrades24h: 0,
        totalHolders: 0,
      }
    );
  }, [tokens]);

  // Recent launches (feed-like)
  const recentTokens = useMemo(() => {
    return [...(tokens || [])]
      .sort((a, b) => {
        const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 12);
  }, [tokens]);

  // Pinned / “Best” launch (placeholder score)
  const pinnedToken = useMemo(() => {
    if (!tokens || tokens.length === 0) return null;
    const sorted = [...tokens].sort((a, b) => {
      const aScore = (a?.holders || 0) + (a?.volume24hUsd || 0) + (a?.trades24h || 0);
      const bScore = (b?.holders || 0) + (b?.volume24hUsd || 0) + (b?.trades24h || 0);
      return bScore - aScore;
    });
    return sorted[0] || null;
  }, [tokens]);

  // Creator level (secondary)
  function computeCreatorLevel(tokensArr, badgesArr, agg) {
    const numTokens = tokensArr.length;
    const numBadges = badgesArr.length;

    const xp =
      numTokens * 25 +
      numBadges * 15 +
      Math.min(agg.totalLiquidity / 250, 500) +
      Math.min(agg.totalVolume24h / 500, 500) +
      Math.min(agg.totalHolders * 0.5, 300);

    if (xp < 50) return { label: "Newcomer", description: "Early in their OriginFi journey." };
    if (xp < 200) return { label: "Emerging Builder", description: "Shipping and gaining traction." };
    if (xp < 600)
      return { label: "Seasoned Architect", description: "Consistent creator with strong signals." };
    return { label: "Meta Origin", description: "High-impact creator with major on-chain footprint." };
  }

  const creatorLevel = computeCreatorLevel(tokens || [], badges || [], aggregate);

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

  // Track record row
  const receipts = useMemo(() => {
    return [
      { label: "Launches", value: String((tokens || []).length) },
      { label: "Badges", value: String((badges || []).length) },
      { label: "Total holders", value: (aggregate.totalHolders || 0).toLocaleString() },
      {
        label: "24h volume",
        value:
          tokens?.length > 0
            ? `$${aggregate.totalVolume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : "—",
      },
    ];
  }, [tokens, badges, aggregate]);

  // Share URL strategy (works even if your app is “pages” not “routes”)
  const shareUrl = useMemo(() => {
    const origin = window?.location?.origin || "https://originfi.net";
    const path = window?.location?.pathname || "/";
    // If your app doesn’t have routes, query params are the safest.
    // Use id if present; else username.
    const qs = new URLSearchParams();
    if (id) qs.set("creatorId", String(id));
    if (username) qs.set("creator", String(username));
    return `${origin}${path}?${qs.toString()}`;
  }, [id, username]);

  async function handleShare() {
    try {
      // Prefer current URL if you’re already “on” the profile view; otherwise use shareUrl
      const urlToCopy = window?.location?.href ? window.location.href : shareUrl;
      await navigator.clipboard.writeText(urlToCopy);
      alert("Profile link copied.");
    } catch {
      alert("Copy failed.");
    }
  }

  // Helpers
  function shortMint(mint) {
    if (!mint || typeof mint !== "string") return "";
    if (mint.length <= 14) return mint;
    return `${mint.slice(0, 6)}…${mint.slice(-6)}`;
  }

  function tokenStatus(t) {
    const activeSignal = Number(t?.holders || 0) > 0 || Number(t?.liquidityUsd || 0) > 0;
    if (activeSignal) return { label: "Active", tone: "good" };
    return { label: "Unknown", tone: "neutral" };
  }

  function openExternal(url) {
    if (!url) return;
    window.open(url, "_blank", "noreferrer");
  }

  function solscanMintUrl(mint) {
    if (!mint) return null;
    return `https://solscan.io/token/${mint}`; // default cluster; add ?cluster=devnet if needed
  }

  function dexscreenerUrl(mint) {
    if (!mint) return null;
    return `https://dexscreener.com/solana/${mint}`;
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

  // Badge rarity styling (uses badge.rarity OR badge.tier OR name heuristics)
  function getBadgeRarity(b) {
    const raw =
      (b?.rarity || b?.tier || b?.level || b?.rank || "").toString().toLowerCase();

    if (["legendary", "mythic"].includes(raw)) return "legendary";
    if (["epic"].includes(raw)) return "epic";
    if (["rare"].includes(raw)) return "rare";
    if (["uncommon"].includes(raw)) return "uncommon";
    if (["common"].includes(raw)) return "common";

    // fallback heuristics by name (optional)
    const name = (b?.name || "").toString().toLowerCase();
    if (name.includes("genesis") || name.includes("founder")) return "legendary";
    if (name.includes("verified") || name.includes("pro")) return "epic";
    if (name.includes("authority") || name.includes("locked")) return "rare";

    return "common";
  }

  const rarityStyles = {
    common: {
      ring: "border-gray-500/35",
      bg: "bg-black",
      glow: "shadow-none",
      text: "text-gray-200",
      sub: "text-gray-400",
      dot: "bg-gray-400",
    },
    uncommon: {
      ring: "border-emerald-400/35",
      bg: "bg-black",
      glow: "shadow-[0_0_18px_rgba(52,211,153,0.10)]",
      text: "text-emerald-200",
      sub: "text-gray-400",
      dot: "bg-emerald-300",
    },
    rare: {
      ring: "border-sky-400/35",
      bg: "bg-black",
      glow: "shadow-[0_0_18px_rgba(56,189,248,0.10)]",
      text: "text-sky-200",
      sub: "text-gray-400",
      dot: "bg-sky-300",
    },
    epic: {
      ring: "border-fuchsia-400/35",
      bg: "bg-black",
      glow: "shadow-[0_0_18px_rgba(232,121,249,0.10)]",
      text: "text-fuchsia-200",
      sub: "text-gray-400",
      dot: "bg-fuchsia-300",
    },
    legendary: {
      ring: "border-amber-400/40",
      bg: "bg-black",
      glow: "shadow-[0_0_22px_rgba(251,191,36,0.12)]",
      text: "text-amber-200",
      sub: "text-gray-400",
      dot: "bg-amber-300",
    },
  };

  return (
    <div className="w-full px-4">
      <div className="mx-auto w-full max-w-6xl">
        {/* Card (internal scroll container) */}
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

          {/* SCROLL AREA */}
          <div
            className="overflow-y-auto pr-2"
            style={{
              maxHeight: "calc(100vh - 28px)",
              scrollbarGutter: "stable",
            }}
          >
            {/* Banner */}
            <div className="relative">
              <div className="w-full h-40 md:h-48 bg-black/40 border-b border-[#1CEAB9]/10 overflow-hidden">
                {bannerImageUrl ? (
                  <img src={bannerImageUrl} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    No banner set
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E11]/80 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Identity */}
              <div className="px-4 pt-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border border-[#1CEAB9]/70 bg-black flex-shrink-0 shadow-[0_0_18px_rgba(28,234,185,0.18)]">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-3xl md:text-4xl font-semibold text-[#1CEAB9]">
                          {(username || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-semibold text-white leading-tight truncate">
                          {username || "OriginFi Creator"}
                        </h1>

                        <span
                          className={`
                            text-[11px] px-2 py-1 rounded-full border
                            ${
                              trust.tier === "High"
                                ? "border-[#1CEAB9]/60 text-[#1CEAB9] bg-[#1CEAB9]/10"
                                : trust.tier === "Medium"
                                ? "border-yellow-400/50 text-yellow-200 bg-yellow-400/10"
                                : "border-red-400/50 text-red-200 bg-red-400/10"
                            }
                          `}
                          title="Tier derived from Trust Score."
                        >
                          {trust.tier} trust
                        </span>
                      </div>

                      <p className="text-[12px] md:text-sm text-gray-200 mt-1 max-w-[72ch]">
                        {creatorInfo || "Building on Solana through OriginFi."}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-gray-400">
                        {createdAtString && (
                          <span>
                            Joined <span className="text-[#1CEAB9] font-mono">{createdAtString}</span>
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
                              className="px-2 py-1 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
                            >
                              X
                            </button>
                          )}
                          {discordUrl && (
                            <button
                              onClick={() => openExternal(discordUrl)}
                              className="px-2 py-1 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
                            >
                              Discord
                            </button>
                          )}
                          {websiteUrl && (
                            <button
                              onClick={() => openExternal(websiteUrl)}
                              className="px-2 py-1 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
                            >
                              Website
                            </button>
                          )}
                          {telegramUrl && (
                            <button
                              onClick={() => openExternal(telegramUrl)}
                              className="px-2 py-1 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
                            >
                              Telegram
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trust score box */}
                  <div className="w-full md:w-[360px]">
                    <div className="rounded-xl border border-[#1CEAB9]/25 bg-[#050709] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-gray-500">
                          Trust score
                        </span>
                        <span className="text-lg font-semibold text-white">
                          <span className="text-[#1CEAB9] font-mono">{trust.score}</span>
                          <span className="text-gray-500 text-sm"> / 100</span>
                        </span>
                      </div>

                      <div className="mt-2 h-2 rounded-full bg-black border border-[#1CEAB9]/10 overflow-hidden">
                        <div className="h-full bg-[#1CEAB9]/70" style={{ width: trustBarWidth }} />
                      </div>

                      <p className="mt-2 text-[11px] text-gray-400">
                        Based on launches, badges, and available on-chain activity.
                      </p>

                      <div className="mt-3 rounded-lg border border-[#1CEAB9]/15 bg-black p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-500">Creator level</span>
                          <span className="text-[12px] font-semibold text-[#1CEAB9]">
                            {creatorLevel.label}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-gray-400">{creatorLevel.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About + Track record */}
                <div className="mt-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 rounded-xl border border-[#1CEAB9]/25 bg-[#050709] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-semibold text-white">About</h2>
                      <span className="text-[11px] text-gray-500">Public profile</span>
                    </div>
                    <div className="rounded-lg border border-[#1CEAB9]/15 bg-black p-3 text-sm text-gray-200 min-h-[72px]">
                      {bio || "This creator hasn’t added a bio yet."}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1CEAB9]/25 bg-[#050709] p-4">
                    <h3 className="text-sm font-semibold text-white mb-2">Track record</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {receipts.map((r) => (
                        <div
                          key={r.label}
                          className="rounded-lg border border-[#1CEAB9]/15 bg-black px-3 py-2"
                        >
                          <p className="text-[10px] uppercase tracking-wide text-gray-500">
                            {r.label}
                          </p>
                          <p className="mt-0.5 text-[13px] font-mono text-[#1CEAB9]">
                            {r.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500">
                      Expands when authority actions + lifecycle are tracked.
                    </p>
                  </div>
                </div>

                {/* Badges (rarity colored) */}
                <div className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">Badges</h3>
                    <span className="text-[11px] text-gray-500">{displayedBadges.length} shown</span>
                  </div>

                  {displayedBadges.length === 0 ? (
                    <div className="rounded-xl border border-[#1CEAB9]/15 bg-[#050709] p-4 text-xs text-gray-500">
                      No badges unlocked yet.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displayedBadges.slice(0, 14).map((badge) => {
                        const rarity = getBadgeRarity(badge);
                        const s = rarityStyles[rarity] || rarityStyles.common;

                        return (
                          <div
                            key={badge.name}
                            className={`px-3 py-2 rounded-xl border ${s.ring} ${s.glow} ${s.bg} hover:bg-white/5 transition`}
                            title={
                              badge.description
                                ? `${badge.name} — ${badge.description}`
                                : badge.name
                            }
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-full border ${s.ring} bg-black flex items-center justify-center text-[12px] ${s.text}`}
                              >
                                {badge.icon || "★"}
                              </div>

                              <div className="flex flex-col leading-tight">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] text-white">{badge.name}</span>
                                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                    {rarity.toUpperCase()}
                                  </span>
                                </div>
                                <span className={`text-[10px] ${s.sub}`}>
                                  {badge.description ? badge.description.slice(0, 44) : "Reputation signal"}
                                  {badge.description && badge.description.length > 44 ? "…" : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pinned launch (clickable -> token profile modal) */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Pinned launch</h3>
                <span className="text-[11px] text-gray-500">Most active (v1)</span>
              </div>

              {!pinnedToken ? (
                <div className="rounded-xl border border-[#1CEAB9]/15 bg-[#050709] p-4 text-xs text-gray-500">
                  No launches pinned yet.
                </div>
              ) : (
                <PinnedTokenCard
                  tokenObj={pinnedToken}
                  tokenStatus={tokenStatus}
                  shortMint={shortMint}
                  solscanMintUrl={solscanMintUrl}
                  dexscreenerUrl={dexscreenerUrl}
                  onOpen={() => setSelectedToken(pinnedToken)}
                  formatUsd={formatUsd}
                  formatNumber={formatNumber}
                />
              )}
            </div>

            {/* Launches feed (clickable -> token profile modal) */}
            <div className="px-4 pb-6">
              <div className="flex items-center justify-between mt-4 mb-2">
                <h3 className="text-sm font-semibold text-white">Launches</h3>
                <span className="text-[11px] text-gray-500">{tokens?.length || 0} total</span>
              </div>

              {!tokens || tokens.length === 0 ? (
                <div className="rounded-xl border border-[#1CEAB9]/15 bg-[#050709] p-4 text-xs text-gray-500">
                  This creator hasn&apos;t launched any tokens through OriginFi yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recentTokens.map((t) => (
                    <LaunchCard
                      key={t?.id || t?.mintAddress || `${Math.random()}`}
                      tokenObj={t}
                      tokenStatus={tokenStatus}
                      shortMint={shortMint}
                      solscanMintUrl={solscanMintUrl}
                      dexscreenerUrl={dexscreenerUrl}
                      onOpen={() => setSelectedToken(t)}
                      formatUsd={formatUsd}
                      formatNumber={formatNumber}
                    />
                  ))}
                </div>
              )}

              <p className="mt-4 text-[11px] text-gray-500">
                Following will surface this creator’s launches in your feed (coming soon).
              </p>
            </div>

            <div className="h-6" />
          </div>

          {/* TOKEN PROFILE MODAL (no routes required) */}
          {selectedToken && (
            <TokenProfileModal
              tokenObj={selectedToken}
              onClose={() => setSelectedToken(null)}
              username={username}
              tokenStatus={tokenStatus}
              solscanMintUrl={solscanMintUrl}
              dexscreenerUrl={dexscreenerUrl}
              formatUsd={formatUsd}
              formatNumber={formatNumber}
              shortMint={shortMint}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ UI Helpers ------------------------------ */

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-[#1CEAB9]/15 bg-black px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-[13px] font-mono text-[#1CEAB9]">{value}</p>
    </div>
  );
}

function PinnedTokenCard({
  tokenObj,
  tokenStatus,
  shortMint,
  solscanMintUrl,
  dexscreenerUrl,
  onOpen,
  formatUsd,
  formatNumber,
}) {
  const s = tokenStatus(tokenObj);
  const mint = tokenObj?.mintAddress;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-2xl border border-[#1CEAB9]/25 bg-[#050709] p-4 hover:border-[#1CEAB9]/45 transition shadow-[0_0_18px_rgba(28,234,185,0.10)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-white truncate">
              {tokenObj?.name || "Unnamed Token"}
            </span>
            {tokenObj?.symbol && (
              <span className="text-[12px] text-[#1CEAB9]">{tokenObj.symbol}</span>
            )}
            <span
              className={`
                text-[10px] px-2 py-1 rounded-full border
                ${
                  s.tone === "good"
                    ? "border-[#1CEAB9]/40 text-[#1CEAB9] bg-[#1CEAB9]/10"
                    : "border-gray-500/40 text-gray-200 bg-white/5"
                }
              `}
            >
              {s.label}
            </span>
          </div>

          {mint && <p className="mt-1 text-[11px] text-gray-400 font-mono">{shortMint(mint)}</p>}
          <p className="mt-2 text-[11px] text-gray-400">
            Click to view token profile
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {dexscreenerUrl(mint) && (
            <a
              href={dexscreenerUrl(mint)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
            >
              Dex
            </a>
          )}
          {solscanMintUrl(mint) && (
            <a
              href={solscanMintUrl(mint)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
            >
              Solscan
            </a>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Metric label="Holders" value={formatNumber(tokenObj?.holders)} />
        <Metric label="24h volume" value={formatUsd(tokenObj?.volume24hUsd)} />
        <Metric label="Liquidity" value={formatUsd(tokenObj?.liquidityUsd)} />
        <Metric label="24h trades" value={formatNumber(tokenObj?.trades24h)} />
      </div>
    </button>
  );
}

function LaunchCard({
  tokenObj,
  tokenStatus,
  shortMint,
  solscanMintUrl,
  dexscreenerUrl,
  onOpen,
  formatUsd,
  formatNumber,
}) {
  const s = tokenStatus(tokenObj);
  const mint = tokenObj?.mintAddress;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-xl border border-[#1CEAB9]/15 bg-[#050709] p-4 hover:border-[#1CEAB9]/35 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-semibold text-white truncate">
              {tokenObj?.name || "Unnamed Token"}
            </span>
            {tokenObj?.symbol && <span className="text-[11px] text-[#1CEAB9]">{tokenObj.symbol}</span>}
            <span
              className={`
                text-[10px] px-2 py-1 rounded-full border
                ${
                  s.tone === "good"
                    ? "border-[#1CEAB9]/40 text-[#1CEAB9] bg-[#1CEAB9]/10"
                    : "border-gray-500/40 text-gray-200 bg-white/5"
                }
              `}
            >
              {s.label}
            </span>
          </div>

          {mint && <p className="mt-1 text-[11px] text-gray-400 font-mono">{shortMint(mint)}</p>}
          <p className="mt-2 text-[11px] text-gray-400">Click to view token profile</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {dexscreenerUrl(mint) && (
            <a
              href={dexscreenerUrl(mint)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 py-1 rounded-full border border-[#1CEAB9]/20 text-[10px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
              title="Open DexScreener"
            >
              Dex
            </a>
          )}
          {solscanMintUrl(mint) && (
            <a
              href={solscanMintUrl(mint)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 py-1 rounded-full border border-[#1CEAB9]/20 text-[10px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
              title="Open Solscan"
            >
              Scan
            </a>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <Metric label="Holders" value={formatNumber(tokenObj?.holders)} />
        <Metric label="24h volume" value={formatUsd(tokenObj?.volume24hUsd)} />
      </div>
    </button>
  );
}

/* --------------------------- Token Profile Modal --------------------------- */

function TokenProfileModal({
  tokenObj,
  onClose,
  username,
  tokenStatus,
  solscanMintUrl,
  dexscreenerUrl,
  formatUsd,
  formatNumber,
  shortMint,
}) {
  const mint = tokenObj?.mintAddress || "";
  const s = tokenStatus(tokenObj);

  // Use tokenObj.priceHistory if present; else generate deterministic pseudo-data
  const series = useMemo(() => {
    const ph = tokenObj?.priceHistory;
    if (Array.isArray(ph) && ph.length >= 12) {
      // normalize to numbers
      return ph.map((x) => Number(x)).filter((n) => isFinite(n)).slice(-60);
    }
    // fallback deterministic series based on mint
    return generateSeriesFromSeed(mint || tokenObj?.symbol || tokenObj?.name || "originfi");
  }, [tokenObj, mint]);

  const changePct = useMemo(() => {
    if (!series || series.length < 2) return null;
    const a = series[0];
    const b = series[series.length - 1];
    if (!isFinite(a) || !isFinite(b) || a === 0) return null;
    return ((b - a) / a) * 100;
  }, [series]);

  function stop(e) {
    e.stopPropagation();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-5xl
          rounded-2xl
          bg-[#0B0E11]
          border border-[#1CEAB9]/50
          shadow-[0_0_40px_rgba(28,234,185,0.14)]
          overflow-hidden
        "
        style={{ maxHeight: "calc(100vh - 40px)" }}
        onClick={stop}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1CEAB9]/15">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-white text-lg font-semibold truncate">
                {tokenObj?.name || "Token Profile"}
              </h3>
              {tokenObj?.symbol && (
                <span className="text-[12px] text-[#1CEAB9]">{tokenObj.symbol}</span>
              )}
              <span
                className={`
                  text-[10px] px-2 py-1 rounded-full border
                  ${
                    s.tone === "good"
                      ? "border-[#1CEAB9]/40 text-[#1CEAB9] bg-[#1CEAB9]/10"
                      : "border-gray-500/40 text-gray-200 bg-white/5"
                  }
                `}
              >
                {s.label}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono mt-1">
              {mint ? shortMint(mint) : "No mint address"}
              {username ? (
                <span className="text-gray-500"> • created by {username}</span>
              ) : null}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mint && (
              <>
                <a
                  href={dexscreenerUrl(mint)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
                >
                  Dex
                </a>
                <a
                  href={solscanMintUrl(mint)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
                >
                  Solscan
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-full border border-gray-600/40 text-[11px] text-gray-200 hover:bg-white/5 transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Modal body scroll */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Chart + headline stats */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-[#1CEAB9]/15 bg-[#050709] p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-sm font-semibold">Price / Activity</h4>
                  <span className="text-[11px] text-gray-400">
                    {changePct == null ? "—" : `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`}
                  </span>
                </div>

                <div className="mt-3 rounded-lg border border-[#1CEAB9]/10 bg-black p-3">
                  <Sparkline values={series} />
                </div>

                <p className="mt-2 text-[11px] text-gray-500">
                  This is a template chart. If you add `token.priceHistory` (array of numbers),
                  it will display real data automatically.
                </p>
              </div>

              <div className="rounded-xl border border-[#1CEAB9]/15 bg-[#050709] p-4">
                <h4 className="text-white text-sm font-semibold mb-2">Token overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <Metric label="Holders" value={formatNumber(tokenObj?.holders)} />
                  <Metric label="24h volume" value={formatUsd(tokenObj?.volume24hUsd)} />
                  <Metric label="Liquidity" value={formatUsd(tokenObj?.liquidityUsd)} />
                  <Metric label="24h trades" value={formatNumber(tokenObj?.trades24h)} />
                </div>
              </div>
            </div>

            {/* Right: Details / links / metadata template */}
            <div className="space-y-4">
              <div className="rounded-xl border border-[#1CEAB9]/15 bg-[#050709] p-4">
                <h4 className="text-white text-sm font-semibold mb-2">Details</h4>
                <div className="space-y-2 text-[12px]">
                  <Row label="Name" value={tokenObj?.name || "—"} />
                  <Row label="Symbol" value={tokenObj?.symbol || "—"} />
                  <Row label="Standard" value={tokenObj?.standard || "SPL"} />
                  <Row
                    label="Created"
                    value={
                      tokenObj?.createdAt
                        ? new Date(tokenObj.createdAt).toLocaleString()
                        : "—"
                    }
                  />
                  <Row label="Mint" value={mint ? mint : "—"} mono />
                </div>
              </div>

              <div className="rounded-xl border border-[#1CEAB9]/15 bg-[#050709] p-4">
                <h4 className="text-white text-sm font-semibold mb-2">Token page template</h4>
                <p className="text-[11px] text-gray-400">
                  This is where your future “token profile” sections go:
                </p>

                <ul className="mt-2 space-y-2 text-[11px] text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-[#1CEAB9]">•</span>
                    Authority receipts (mint revoked / freeze revoked / metadata locked)
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1CEAB9]">•</span>
                    Holder distribution / top holders (later)
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1CEAB9]">•</span>
                    Live chart + timeframe toggles (1H/24H/7D)
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1CEAB9]">•</span>
                    Social links, website, and “creator verification”
                  </li>
                </ul>

                <div className="mt-3 rounded-lg border border-[#1CEAB9]/10 bg-black p-3">
                  <p className="text-[11px] text-gray-400">
                    When you’re ready, you can swap this modal into a real “token view”
                    component without needing routes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className={`${mono ? "font-mono" : ""} text-gray-200 break-all text-right`}>
        {value}
      </span>
    </div>
  );
}

/* ------------------------------ Mini Chart ------------------------------ */

function Sparkline({ values }) {
  const w = 700;
  const h = 160;
  const pad = 10;

  const safe = Array.isArray(values) ? values.filter((n) => isFinite(n)) : [];
  if (safe.length < 2) {
    return (
      <div className="text-xs text-gray-500">
        Not enough data to render chart.
      </div>
    );
  }

  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const span = max - min || 1;

  const points = safe
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / (safe.length - 1);
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
      {/* subtle baseline */}
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

function generateSeriesFromSeed(seedStr) {
  const seed = hashString(seedStr);
  const len = 60;
  let v = 50 + (seed % 25);

  const out = [];
  for (let i = 0; i < len; i++) {
    // pseudo-random walk (deterministic)
    const r = pseudoRand(seed + i * 9973);
    const drift = Math.sin((i + (seed % 17)) / 7) * 0.8;
    v = v + (r - 0.5) * 6 + drift;
    v = Math.max(5, Math.min(120, v));
    out.push(v);
  }
  return out;
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pseudoRand(n) {
  // xorshift-ish deterministic random in [0,1)
  let x = n >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) / 4294967296;
}
