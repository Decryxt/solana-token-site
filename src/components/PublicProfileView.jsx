import React, { useEffect, useMemo, useState } from "react";

/**
 * PublicProfileView (SOCIAL REWORK v2)
 * Fixes requested:
 * - Banner/identity overlap cleaned up (no awkward collisions)
 * - Internal scroll works (card has its own scroll area + visible scrollbar)
 * - Trust score displayed as 0–100 (more “detailed”), computed client-side (no backend changes)
 *
 * Constraints:
 * - Card never extends past the screen; content scrolls inside the card.
 */

export default function PublicProfileView({ user, onBack }) {
  if (!user) return null;

  const [isFollowing, setIsFollowing] = useState(false);
  const [localFollowers, setLocalFollowers] = useState(
    typeof user.followersCount === "number" ? user.followersCount : 0
  );

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

  // Featured badges: current behavior assumes featuredBadgeIds stores badge names.
  // If later you store real ids, swap includes(b.name) -> includes(b.id).
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

  // Creator level (secondary “vibe” label)
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

  /**
   * Trust Score 0–100 (v1)
   * Intent:
   * - Looks “detailed” and consistent
   * - Hard-capped so whales don’t instantly become 100
   * - Uses only data you already have on the profile response
   *
   * Later upgrade:
   * - Replace/extend with real receipts like mint revoked %, freeze revoked %, metadata locked %
   */
  const trust = useMemo(() => {
    const numTokens = (tokens || []).length;
    const numBadges = (badges || []).length;

    // Normalize / cap everything to avoid crazy scores
    const tokenScore = Math.min(numTokens * 6, 30); // up to 30
    const badgeScore = Math.min(numBadges * 4, 20); // up to 20
    const holderScore = Math.min(aggregate.totalHolders / 200, 20); // up to 20
    const liquidityScore = Math.min(aggregate.totalLiquidity / 5000, 15); // up to 15
    const volumeScore = Math.min(aggregate.totalVolume24h / 15000, 15); // up to 15

    const raw = tokenScore + badgeScore + holderScore + liquidityScore + volumeScore;
    const score = Math.max(0, Math.min(100, Math.round(raw)));

    let tier = "Low";
    if (score >= 75) tier = "High";
    else if (score >= 45) tier = "Medium";

    return { score, tier };
  }, [tokens, badges, aggregate]);

  // Social “receipts” row (best-effort)
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

  // Helpers
  function shortMint(mint) {
    if (!mint || typeof mint !== "string") return "";
    if (mint.length <= 14) return mint;
    return `${mint.slice(0, 6)}…${mint.slice(-6)}`;
  }

  function tokenStatus(t) {
    // Placeholder: swap later when you store a real status field
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
    return `https://solscan.io/token/${mint}`;
  }

  function dexscreenerUrl(mint) {
    if (!mint) return null;
    return `https://dexscreener.com/solana/${mint}`;
  }

  const trustBarWidth = `${Math.max(0, Math.min(100, trust.score))}%`;

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
                        ? "border-gray-500 text-gray-300 hover:bg-white/5"
                        : "border-[#1CEAB9]/60 text-[#1CEAB9] hover:bg-[#1CEAB9]/10"
                    }
                  `}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Profile link copied.");
                    } catch {
                      alert("Copy failed.");
                    }
                  }}
                  className="px-3 py-1.5 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
                >
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* SCROLL AREA (this is where the scrollbar should appear) */}
          <div className="overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 28px)" }}>
            {/* Banner + Identity block (no overlap) */}
            <div className="relative">
              {/* Banner */}
              <div className="w-full h-40 md:h-48 bg-black/40 border-b border-[#1CEAB9]/10 overflow-hidden">
                {bannerImageUrl ? (
                  <img
                    src={bannerImageUrl}
                    alt="Banner"
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    No banner set
                  </div>
                )}

                {/* Subtle fade for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E11]/95 via-[#0B0E11]/25 to-transparent pointer-events-none" />
              </div>

              {/* Avatar + name row sits BELOW banner, not overlapping awkwardly */}
              <div className="px-4 pt-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Identity */}
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

                        {/* Tier pill (secondary) */}
                        <span
                          className={`
                            text-[11px] px-2 py-1 rounded-full border
                            ${
                              trust.tier === "High"
                                ? "border-[#1CEAB9]/60 text-[#1CEAB9] bg-[#1CEAB9]/10"
                                : trust.tier === "Medium"
                                ? "border-yellow-400/50 text-yellow-300 bg-yellow-400/10"
                                : "border-red-400/50 text-red-300 bg-red-400/10"
                            }
                          `}
                          title="Tier derived from the Trust Score."
                        >
                          {trust.tier} trust
                        </span>
                      </div>

                      <p className="text-[12px] md:text-sm text-gray-300 mt-1 max-w-[72ch]">
                        {creatorInfo || "Building on Solana through OriginFi."}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-gray-400">
                        {createdAtString && (
                          <span>
                            Joined{" "}
                            <span className="text-[#1CEAB9] font-mono">{createdAtString}</span>
                          </span>
                        )}
                        <span className="opacity-40">•</span>
                        <span>
                          <span className="text-[#1CEAB9] font-mono">{safeFollowers}</span>{" "}
                          Followers
                        </span>
                        <span className="opacity-40">•</span>
                        <span>
                          <span className="text-[#1CEAB9] font-mono">{safeFollowing}</span>{" "}
                          Following
                        </span>
                      </div>

                      {/* Social links */}
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

                  {/* Trust score box (0–100) */}
                  <div className="w-full md:w-[360px]">
                    <div className="rounded-xl border border-[#1CEAB9]/25 bg-black/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-gray-400">
                          Trust score
                        </span>
                        <span className="text-lg font-semibold text-white">
                          <span className="text-[#1CEAB9] font-mono">{trust.score}</span>
                          <span className="text-gray-500 text-sm"> / 100</span>
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 h-2 rounded-full bg-white/5 border border-[#1CEAB9]/10 overflow-hidden">
                        <div
                          className="h-full bg-[#1CEAB9]/70"
                          style={{ width: trustBarWidth }}
                        />
                      </div>

                      <p className="mt-2 text-[11px] text-gray-500">
                        Based on launches, badges, and available on-chain activity.
                      </p>

                      {/* Creator level (secondary) */}
                      <div className="mt-3 rounded-lg border border-[#1CEAB9]/15 bg-[#050709] px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-400">Creator level</span>
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
                <div className="mt-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 px-4">
                  <div className="md:col-span-2 rounded-xl border border-[#1CEAB9]/25 bg-[#050709] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-semibold text-white">About</h2>
                      <span className="text-[11px] text-gray-500">Public profile</span>
                    </div>
                    <div className="rounded-lg border border-[#1CEAB9]/15 bg-black/60 p-3 text-sm text-gray-200 min-h-[72px]">
                      {bio || "This creator hasn’t added a bio yet."}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1CEAB9]/25 bg-black/60 p-4">
                    <h3 className="text-sm font-semibold text-white mb-2">Track record</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {receipts.map((r) => (
                        <div
                          key={r.label}
                          className="rounded-lg border border-[#1CEAB9]/15 bg-[#050709] px-3 py-2"
                        >
                          <p className="text-[10px] uppercase tracking-wide text-gray-400">
                            {r.label}
                          </p>
                          <p className="mt-0.5 text-[13px] font-mono text-[#1CEAB9]">
                            {r.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500">
                      This expands when authority actions + token lifecycle are tracked.
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="px-4 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">Badges</h3>
                    <span className="text-[11px] text-gray-500">
                      {displayedBadges.length} shown
                    </span>
                  </div>

                  {displayedBadges.length === 0 ? (
                    <div className="rounded-xl border border-[#1CEAB9]/15 bg-black/60 p-4 text-xs text-gray-500">
                      No badges unlocked yet.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displayedBadges.slice(0, 12).map((badge) => (
                        <div
                          key={badge.name}
                          className="px-3 py-2 rounded-xl border border-[#1CEAB9]/25 bg-[#050709] hover:bg-[#1CEAB9]/10 transition"
                          title={
                            badge.description
                              ? `${badge.name} — ${badge.description}`
                              : badge.name
                          }
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full border border-[#1CEAB9]/45 bg-black flex items-center justify-center text-[12px] text-[#1CEAB9]">
                              {badge.icon || "★"}
                            </div>
                            <div className="flex flex-col leading-tight">
                              <span className="text-[12px] text-white">{badge.name}</span>
                              <span className="text-[10px] text-gray-400">
                                {badge.description ? badge.description.slice(0, 42) : "Reputation signal"}
                                {badge.description && badge.description.length > 42 ? "…" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pinned launch */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Pinned launch</h3>
                <span className="text-[11px] text-gray-500">Most active (v1)</span>
              </div>

              {!pinnedToken ? (
                <div className="rounded-xl border border-[#1CEAB9]/15 bg-black/60 p-4 text-xs text-gray-500">
                  No launches pinned yet.
                </div>
              ) : (
                <PinnedTokenCard
                  tokenObj={pinnedToken}
                  tokenStatus={tokenStatus}
                  shortMint={shortMint}
                  solscanMintUrl={solscanMintUrl}
                  dexscreenerUrl={dexscreenerUrl}
                />
              )}
            </div>

            {/* Launches feed */}
            <div className="px-4 pb-6">
              <div className="flex items-center justify-between mt-4 mb-2">
                <h3 className="text-sm font-semibold text-white">Launches</h3>
                <span className="text-[11px] text-gray-500">{tokens?.length || 0} total</span>
              </div>

              {!tokens || tokens.length === 0 ? (
                <div className="rounded-xl border border-[#1CEAB9]/15 bg-black/60 p-4 text-xs text-gray-500">
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
                    />
                  ))}
                </div>
              )}

              {/* On-chain performance */}
              <div className="mt-5 rounded-xl border border-[#1CEAB9]/15 bg-black/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">On-chain performance</h3>
                  <span className="text-[10px] text-gray-500">Aggregated</span>
                </div>

                {!tokens || tokens.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Once this creator has launches with activity, performance will appear here.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <Metric
                      label="Total liquidity"
                      value={`$${aggregate.totalLiquidity.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}`}
                    />
                    <Metric
                      label="24h volume"
                      value={`$${aggregate.totalVolume24h.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}`}
                    />
                    <Metric label="24h trades" value={aggregate.totalTrades24h.toLocaleString()} />
                    <Metric label="Total holders" value={aggregate.totalHolders.toLocaleString()} />
                  </div>
                )}
              </div>

              <p className="mt-4 text-[11px] text-gray-500">
                Following will surface this creator’s launches in your feed (coming soon).
              </p>
            </div>

            {/* Spacer so last items don’t feel cramped */}
            <div className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-[#1CEAB9]/15 bg-[#050709] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-[13px] font-mono text-[#1CEAB9]">{value}</p>
    </div>
  );
}

function PinnedTokenCard({ tokenObj, tokenStatus, shortMint, solscanMintUrl, dexscreenerUrl }) {
  const s = tokenStatus(tokenObj);
  const mint = tokenObj?.mintAddress;

  return (
    <div className="rounded-2xl border border-[#1CEAB9]/25 bg-[#050709] p-4 shadow-[0_0_18px_rgba(28,234,185,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-white truncate">
              {tokenObj?.name || "Unnamed Token"}
            </span>
            {tokenObj?.symbol && <span className="text-[12px] text-[#1CEAB9]">{tokenObj.symbol}</span>}
            <span
              className={`
                text-[10px] px-2 py-1 rounded-full border
                ${
                  s.tone === "good"
                    ? "border-[#1CEAB9]/40 text-[#1CEAB9] bg-[#1CEAB9]/10"
                    : "border-gray-500/40 text-gray-300 bg-white/5"
                }
              `}
            >
              {s.label}
            </span>
          </div>

          {mint && (
            <p className="mt-1 text-[11px] text-gray-400 font-mono">{shortMint(mint)}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {dexscreenerUrl(mint) && (
            <a
              href={dexscreenerUrl(mint)}
              target="_blank"
              rel="noreferrer"
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
              className="px-3 py-1.5 rounded-full border border-[#1CEAB9]/25 text-[11px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
            >
              Solscan
            </a>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Metric label="Holders" value={String(tokenObj?.holders ?? "—")} />
        <Metric
          label="24h volume"
          value={
            tokenObj?.volume24hUsd
              ? `$${Number(tokenObj.volume24hUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : "—"
          }
        />
        <Metric
          label="Liquidity"
          value={
            tokenObj?.liquidityUsd
              ? `$${Number(tokenObj.liquidityUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : "—"
          }
        />
        <Metric label="24h trades" value={String(tokenObj?.trades24h ?? "—")} />
      </div>

      <p className="mt-3 text-[11px] text-gray-500">
        Pinned launch is selected using holders/volume/trades (v1 logic).
      </p>
    </div>
  );
}

function LaunchCard({ tokenObj, tokenStatus, shortMint, solscanMintUrl, dexscreenerUrl }) {
  const s = tokenStatus(tokenObj);
  const mint = tokenObj?.mintAddress;

  return (
    <div className="rounded-xl border border-[#1CEAB9]/15 bg-black/60 p-4 hover:border-[#1CEAB9]/30 transition">
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
                    : "border-gray-500/40 text-gray-300 bg-white/5"
                }
              `}
            >
              {s.label}
            </span>
          </div>

          {mint && <p className="mt-1 text-[11px] text-gray-400 font-mono">{shortMint(mint)}</p>}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {dexscreenerUrl(mint) && (
            <a
              href={dexscreenerUrl(mint)}
              target="_blank"
              rel="noreferrer"
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
              className="px-2.5 py-1 rounded-full border border-[#1CEAB9]/20 text-[10px] text-gray-200 hover:bg-[#1CEAB9]/10 transition"
              title="Open Solscan"
            >
              Scan
            </a>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-[#1CEAB9]/10 bg-[#050709] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Holders</p>
          <p className="mt-0.5 text-[13px] font-mono text-[#1CEAB9]">{tokenObj?.holders ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-[#1CEAB9]/10 bg-[#050709] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">24h volume</p>
          <p className="mt-0.5 text-[13px] font-mono text-[#1CEAB9]">
            {tokenObj?.volume24hUsd
              ? `$${Number(tokenObj.volume24hUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
