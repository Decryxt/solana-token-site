import React from "react";

export default function PublicProfileView({ user, onBack }) {
  if (!user) return null;

  const {
    username,
    profileImageUrl,
    bannerImageUrl,
    createdAt,
    badges = [],
    tokens = [],
    bio,
    creatorInfo,
    featuredBadgeIds = [],

    // Optional extras
    twitterUrl,
    discordUrl,
    websiteUrl,
    telegramUrl,
    followersCount,
    followingCount,
  } = user;

  const createdAtString = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : null;

  // Decide which badges to show: featured ones if set, else all
  const displayedBadges =
    featuredBadgeIds && featuredBadgeIds.length > 0
      ? badges.filter(
          (b) =>
            typeof b.name === "string" && featuredBadgeIds.includes(b.name)
        )
      : badges;

  // Recent tokens (up to 3)
  const recentTokens = [...tokens]
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 3);

  // "Most popular" token – placeholder logic
  const mostPopularToken =
    tokens.length > 0
      ? [...tokens].sort((a, b) => {
          const aScore =
            (a.holders || 0) + (a.volume24hUsd || 0) + (a.trades24h || 0);
          const bScore =
            (b.holders || 0) + (b.volume24hUsd || 0) + (b.trades24h || 0);
          return bScore - aScore;
        })[0]
      : null;

  // Aggregate on-chain performance across all tokens
  const aggregate = tokens.reduce(
    (acc, t) => {
      const liq = Number(t.liquidityUsd || 0);
      const vol = Number(t.volume24hUsd || 0);
      const trades = Number(t.trades24h || 0);
      const holders = Number(t.holders || 0);

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

  // Long-term oriented creator level system
  function computeCreatorLevel(tokensArr, badgesArr, agg) {
    const numTokens = tokensArr.length;
    const numBadges = badgesArr.length;

    const xp =
      numTokens * 25 +
      numBadges * 15 +
      Math.min(agg.totalLiquidity / 250, 500) +
      Math.min(agg.totalVolume24h / 500, 500) +
      Math.min(agg.totalHolders * 0.5, 300);

    if (xp < 50) {
      return {
        label: "Newcomer",
        description: "Just getting started on OriginFi. Early in their journey.",
      };
    }
    if (xp < 200) {
      return {
        label: "Emerging Builder",
        description:
          "Actively experimenting with launches and starting to ship.",
      };
    }
    if (xp < 600) {
      return {
        label: "Seasoned Architect",
        description:
          "Consistent creator with traction, volume, and community signals.",
      };
    }
    return {
      label: "Meta Origin",
      description:
        "High-impact builder with strong on-chain footprint across liquidity, volume, and holders.",
    };
  }

  const creatorLevel = computeCreatorLevel(tokens, badges, aggregate);

  const hasAnySocial =
    twitterUrl || discordUrl || websiteUrl || telegramUrl;

  const safeFollowers = typeof followersCount === "number" ? followersCount : 0;
  const safeFollowing = typeof followingCount === "number" ? followingCount : 0;

  return (
    <div className="w-full flex justify-center mt-1 px-4 mb-16">
      {/* Wider and slightly tighter padding */}
      <div className="w-full max-w-6xl rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-[0_0_25px_rgba(28,234,185,0.18)] p-5 md:p-6">
        {/* Top row: back button + centered logo + follow button slot */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="
              px-4 py-1.5
              rounded-lg
              border border-[#1CEAB9]/50
              text-xs md:text-sm
              text-white
              hover:bg-[#1CEAB9]/10
              transition
            "
          >
            ← Back
          </button>

          <div className="flex-1 flex justify-center">
            <div className="text-xl md:text-2xl font-extrabold tracking-normal">
              <span className="text-white">Origin</span>
              <span className="text-[#1CEAB9]">Fi</span>
            </div>
          </div>

          {/* Follow button placeholder – ready for wiring later */}
          <div className="flex justify-end w-[90px]">
            <button
              type="button"
              className="
                px-3 py-1
                rounded-full
                border border-[#1CEAB9]/60
                text-[11px]
                text-[#1CEAB9]
                hover:bg-[#1CEAB9]/10
                transition
              "
              onClick={() => {
                console.log("Follow clicked (not yet wired).");
              }}
            >
              Follow
            </button>
          </div>
        </div>

        {/* Banner – slightly shorter */}
        <div className="w-full h-28 md:h-32 rounded-xl overflow-hidden bg-black/40 border border-[#1CEAB9]/25 mb-4">
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
        </div>

        {/* Avatar + username + badges inline */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          {/* Left: avatar + username + creator info + social */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="w-18 h-18 md:w-20 md:h-20 rounded-full overflow-hidden border border-[#1CEAB9]/60 bg-black flex-shrink-0">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-2xl md:text-3xl font-semibold text-[#1CEAB9]">
                    {(username || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-semibold text-white">
                  {username || "OriginFi Creator"}
                </h1>
                {creatorInfo && (
                  <p className="text-xs text-gray-300 mt-1">
                    {creatorInfo}
                  </p>
                )}
                {createdAtString && (
                  <p className="text-xs text-gray-500 mt-1">
                    Member since{" "}
                    <span className="text-[#1CEAB9]">
                      {createdAtString}
                    </span>
                  </p>
                )}

                {/* Followers / Following small row */}
                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                  <span>
                    <span className="text-[#1CEAB9] font-mono">
                      {safeFollowers}
                    </span>{" "}
                    Followers
                  </span>
                  <span className="opacity-40">•</span>
                  <span>
                    <span className="text-[#1CEAB9] font-mono">
                      {safeFollowing}
                    </span>{" "}
                    Following
                  </span>
                </div>
              </div>
            </div>

            {/* Social links row – small, compact */}
            {hasAnySocial && (
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-300 mt-1">
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      px-2 py-1
                      rounded-full
                      border border-[#1CEAB9]/40
                      bg-black
                      hover:bg-[#1CEAB9]/10
                      transition
                    "
                  >
                    X / Twitter
                  </a>
                )}
                {discordUrl && (
                  <a
                    href={discordUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      px-2 py-1
                      rounded-full
                      border border-[#1CEAB9]/40
                      bg-black
                      hover:bg-[#1CEAB9]/10
                      transition
                    "
                  >
                    Discord
                  </a>
                )}
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      px-2 py-1
                      rounded-full
                      border border-[#1CEAB9]/40
                      bg-black
                      hover:bg-[#1CEAB9]/10
                      transition
                    "
                  >
                    Website
                  </a>
                )}
                {telegramUrl && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      px-2 py-1
                      rounded-full
                      border border-[#1CEAB9]/40
                      bg-black
                      hover:bg-[#1CEAB9]/10
                      transition
                    "
                  >
                    Telegram
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: badges row */}
          <div className="flex flex-wrap gap-2 md:justify-end">
            {displayedBadges.length === 0 ? (
              <p className="text-[11px] text-gray-500">
                No badges unlocked yet.
              </p>
            ) : (
              displayedBadges.slice(0, 10).map((badge) => (
                <div
                  key={badge.name}
                  className="
                    w-8 h-8
                    rounded-full
                    border border-[#1CEAB9]/60
                    bg-black
                    flex items-center justify-center
                    text-[11px]
                    text-[#1CEAB9]
                    cursor-default
                    hover:bg-[#1CEAB9]/10
                    transition
                  "
                  title={
                    badge.description
                      ? `${badge.name} — ${badge.description}`
                      : badge.name
                  }
                >
                  {badge.icon || "★"}
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN CONTENT: 2 columns to make it shorter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT COLUMN: Bio + Tokens */}
          <div className="space-y-4">
            {/* Creator overview / bio */}
            <div className="rounded-xl border border-[#1CEAB9]/40 bg-[#050709] p-4">
              <h2 className="text-sm font-semibold text-white mb-1">
                Creator overview
              </h2>
              <p className="text-[11px] text-gray-400 mb-2">
                Public info about this creator.
              </p>
              <div className="rounded-lg border border-[#1CEAB9]/20 bg-black/60 p-3 text-sm text-gray-200 min-h-[60px]">
                {bio ||
                  creatorInfo ||
                  "This creator hasn’t added a bio yet."}
              </div>
            </div>

            {/* Tokens (recent & popular) */}
            <div className="rounded-xl border border-[#1CEAB9]/25 bg-black/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">
                  Tokens (recent & popular)
                </h3>
                <span className="text-[11px] text-gray-400">
                  {tokens.length} total
                </span>
              </div>

              {tokens.length === 0 ? (
                <p className="text-xs text-gray-500">
                  This creator hasn&apos;t launched any tokens through OriginFi
                  yet.
                </p>
              ) : (
                <div className="space-y-3 text-xs">
                  {recentTokens.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                        Recent
                      </p>
                      <div className="space-y-1.5">
                        {recentTokens.map((token) => (
                          <div
                            key={token.id || token.mintAddress}
                            className="rounded-md border border-[#1CEAB9]/20 bg-[#050709] px-3 py-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex flex-col">
                                <span className="text-[13px] text-white">
                                  {token.name || "Unnamed Token"}
                                </span>
                                {token.symbol && (
                                  <span className="text-[11px] text-[#1CEAB9]">
                                    {token.symbol}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] uppercase tracking-wide text-gray-500">
                                SPL
                              </span>
                            </div>
                            {token.mintAddress && (
                              <p className="text-[10px] text-gray-400 break-all mt-1">
                                {token.mintAddress}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mostPopularToken && (
                    <div className="mt-2">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                        Most popular
                      </p>
                      <div className="rounded-md border border-[#1CEAB9]/30 bg-[#050709] px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-[13px] text-white">
                              {mostPopularToken.name || "Unnamed Token"}
                            </span>
                            {mostPopularToken.symbol && (
                              <span className="text-[11px] text-[#1CEAB9]">
                                {mostPopularToken.symbol}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] uppercase tracking-wide text-[#1CEAB9]">
                            Highlight
                          </span>
                        </div>
                        {mostPopularToken.mintAddress && (
                          <p className="text-[10px] text-gray-400 break-all mt-1">
                            {mostPopularToken.mintAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Stats + On-chain performance */}
          <div className="space-y-4">
            {/* Creator stats (includes level) */}
            <div className="rounded-xl border border-[#1CEAB9]/25 bg-black/60 p-4">
              <h3 className="text-sm font-semibold text-white mb-2">
                Creator stats
              </h3>

              {/* Creator level row */}
              <div className="mb-3 rounded-md border border-[#1CEAB9]/35 bg-[#050709] px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wide text-gray-400">
                    Creator level
                  </span>
                  <span className="text-[12px] font-semibold text-[#1CEAB9]">
                    {creatorLevel.label}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  {creatorLevel.description}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Tokens created</span>
                  <span className="font-mono text-[#1CEAB9]">
                    {tokens.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Badges earned</span>
                  <span className="font-mono text-[#1CEAB9]">
                    {badges.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Has banner</span>
                  <span className="font-mono text-gray-300">
                    {bannerImageUrl ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Has avatar</span>
                  <span className="font-mono text-gray-300">
                    {profileImageUrl ? "Yes" : "No"}
                  </span>
                </div>
                {createdAtString && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Joined</span>
                    <span className="font-mono text-gray-300">
                      {createdAtString}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* On-chain performance – now in the right column, not full width */}
            <div className="rounded-xl border border-[#1CEAB9]/25 bg-black/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">
                  On-chain performance
                </h3>
                <span className="text-[10px] text-gray-500">
                  Aggregated across tokens
                </span>
              </div>

              {tokens.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Once this creator launches tokens with on-chain activity,
                  liquidity, volume and holder stats will appear here.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">
                      Total liquidity
                    </p>
                    <p className="font-mono text-[#1CEAB9]">
                      $
                      {aggregate.totalLiquidity.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">
                      24h volume
                    </p>
                    <p className="font-mono text-[#1CEAB9]">
                      $
                      {aggregate.totalVolume24h.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">
                      24h trades
                    </p>
                    <p className="font-mono text-[#1CEAB9]">
                      {aggregate.totalTrades24h.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">
                      Total holders
                    </p>
                    <p className="font-mono text-[#1CEAB9]">
                      {aggregate.totalHolders.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
