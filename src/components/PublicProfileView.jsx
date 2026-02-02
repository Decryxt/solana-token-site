import React, { useEffect, useMemo, useState } from "react";
import TokenProfile from "./TokenProfile";

export default function PublicProfileView({ user, onBack }) {
  if (!user) return null;

  const [isFollowing, setIsFollowing] = useState(false);
  const [localFollowers, setLocalFollowers] = useState(
    typeof user.followersCount === "number" ? user.followersCount : 0
  );
  const [selectedToken, setSelectedToken] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});

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

  if (selectedToken) {
    return (
      <TokenProfile
        token={selectedToken}
        creator={user}
        onBack={() => setSelectedToken(null)}
      />
    );
  }

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

  const displayedBadges =
    Array.isArray(featuredBadgeIds) && featuredBadgeIds.length > 0
      ? (badges || []).filter((b) => b?.name && featuredBadgeIds.includes(b.name))
      : badges || [];

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

  // Rarity styles: INSIDE GLOW + (for legendary) MYTHICAL “woah” aura + shimmer
  const rarity = {
    common: {
      ring: "border-gray-500/35",
      dot: "bg-gray-300",
      name: "text-gray-100",
      sub: "text-gray-200",
      surface: "bg-[#101a23]",
      glowStyle: { boxShadow: "inset 0 0 18px rgba(255,255,255,0.04)" },
      mythic: false,
    },
    uncommon: {
      ring: "border-emerald-400/55",
      dot: "bg-emerald-300",
      name: "text-emerald-100",
      sub: "text-gray-100",
      surface: "bg-[#101a23]",
      glowStyle: {
        boxShadow:
          "inset 0 0 18px rgba(52,211,153,0.18), 0 0 18px rgba(52,211,153,0.12)",
      },
      mythic: false,
    },
    rare: {
      ring: "border-sky-400/55",
      dot: "bg-sky-300",
      name: "text-sky-100",
      sub: "text-gray-100",
      surface: "bg-[#101a23]",
      glowStyle: {
        boxShadow:
          "inset 0 0 18px rgba(56,189,248,0.18), 0 0 18px rgba(56,189,248,0.12)",
      },
      mythic: false,
    },
    epic: {
      ring: "border-fuchsia-400/55",
      dot: "bg-fuchsia-300",
      name: "text-fuchsia-100",
      sub: "text-gray-100",
      surface: "bg-[#101a23]",
      glowStyle: {
        boxShadow:
          "inset 0 0 18px rgba(232,121,249,0.18), 0 0 20px rgba(232,121,249,0.12)",
      },
      mythic: false,
    },
    legendary: {
      ring: "border-amber-300/65",
      dot: "bg-amber-200",
      name: "text-amber-100",
      sub: "text-gray-100",
      // slightly richer surface so it pops
      surface: "bg-[#121016]",
      glowStyle: {
        boxShadow:
          "inset 0 0 22px rgba(251,191,36,0.28), 0 0 28px rgba(251,191,36,0.18), 0 0 46px rgba(232,121,249,0.10)",
      },
      mythic: true,
    },
  };

  return (
    <div className="w-full px-4">
      <div className="mx-auto w-full max-w-6xl">
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
          <div className="sticky top-0 z-30 bg-[#0B0E11]/95 backdrop-blur border-b border-[#1CEAB9]/15">
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
            {/* Banner */}
            <div className="relative">
              <div className="w-full h-36 md:h-48 bg-black/40 border-b border-[#1CEAB9]/10 overflow-hidden">
                {bannerImageUrl ? (
                  <img src={bannerImageUrl} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    No banner set
                  </div>
                )}

                {/* Make the banner feel less "covered" */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E11]/55 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Identity pulled up even less + give it breathing room */}
              <div className="px-4 -mt-5 md:-mt-6 pb-3 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-3">
                  {/* Left */}
                  <div className="rounded-2xl border border-[#1CEAB9]/12 bg-[#0E141B] p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 md:w-18 md:h-18 rounded-full overflow-hidden border border-[#1CEAB9]/70 bg-black flex-shrink-0 shadow-[0_0_18px_rgba(28,234,185,0.18)]">
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
                            <span className="text-[#1CEAB9] font-mono">{safeFollowers}</span>{" "}
                            Followers
                          </span>
                          <span className="opacity-40">•</span>
                          <span>
                            <span className="text-[#1CEAB9] font-mono">{safeFollowing}</span>{" "}
                            Following
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

                    {/* About */}
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

                  {/* Right: Trust */}
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

                {/* Badges */}
                <div className="mt-3 rounded-2xl border border-[#1CEAB9]/12 bg-[#0E141B] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">Badges</h3>
                    <span className="text-[11px] text-gray-400">{displayedBadges.length} shown</span>
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
                              relative overflow-hidden
                              rounded-xl border ${s.ring}
                              ${s.surface}
                              px-3 py-2
                              hover:bg-[#0f1c26]
                              transition
                            `}
                            style={s.glowStyle}
                            title={b.description ? `${b.name} — ${b.description}` : b.name}
                          >
                            {/* Mythic aura + shimmer only for legendary */}
                            {s.mythic ? (
                              <>
                                <div
                                  className="absolute -inset-6 opacity-80 pointer-events-none"
                                  style={{
                                    background:
                                      "radial-gradient(circle at 30% 20%, rgba(251,191,36,0.22), transparent 55%), radial-gradient(circle at 70% 80%, rgba(232,121,249,0.16), transparent 55%)",
                                  }}
                                />
                                <div className="badgeShimmer absolute inset-0 opacity-40 pointer-events-none" />
                              </>
                            ) : null}

                            <div className="relative z-10 flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-full border ${s.ring} bg-black flex items-center justify-center text-[12px] ${s.name}`}
                                style={s.glowStyle}
                              >
                                {b.icon || "★"}
                              </div>

                              <div className="flex flex-col leading-tight min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[12px] text-white truncate">{b.name}</span>

                                  <span className="flex items-center gap-1 text-[10px] text-gray-200 whitespace-nowrap">
                                    <span
                                      className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`}
                                    />
                                    {s.mythic ? "MYTHIC" : r.toUpperCase()}
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

                {/* Tokens */}
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
                          brokenImages={brokenImages}
                          setBrokenImages={setBrokenImages}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Shimmer CSS */}
                <style>{`
                  .badgeShimmer {
                    background: linear-gradient(
                      110deg,
                      transparent 0%,
                      rgba(255,255,255,0.08) 18%,
                      rgba(251,191,36,0.10) 32%,
                      rgba(232,121,249,0.10) 48%,
                      rgba(255,255,255,0.06) 62%,
                      transparent 80%
                    );
                    transform: translateX(-60%);
                    animation: shimmerMove 2.8s linear infinite;
                  }
                  @keyframes shimmerMove {
                    0% { transform: translateX(-60%); }
                    100% { transform: translateX(60%); }
                  }
                `}</style>
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

function TokenCard({
  tokenObj,
  onOpen,
  shortMint,
  formatUsd,
  formatNumber,
  brokenImages,
  setBrokenImages,
}) {
  const mint = tokenObj?.mintAddress;
  const name = tokenObj?.name || "Unnamed Token";
  const symbol = tokenObj?.symbol || "";

  const rawThumb =
    tokenObj?.imageUrl ||
    tokenObj?.logoUrl ||
    tokenObj?.thumbnailUrl ||
    tokenObj?.image ||
    tokenObj?.icon ||
    tokenObj?.metadataImage ||
    "";

  const thumb = normalizeImgUrl(rawThumb);
  const thumbKey = mint || `${name}:${symbol}`;
  const shouldFallback = !!brokenImages[thumbKey] || !thumb;

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
      <div className="w-14 h-14 rounded-xl border border-[#1CEAB9]/18 overflow-hidden bg-black flex items-center justify-center flex-shrink-0">
        {shouldFallback ? (
          <div className="text-white/90 font-semibold text-sm">
            {getInitials(symbol || name || "?")}
          </div>
        ) : (
          <img
            src={thumb}
            alt="Token thumbnail"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setBrokenImages((p) => ({ ...p, [thumbKey]: true }))}
          />
        )}
      </div>

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

          <span className="text-[11px] text-gray-300 whitespace-nowrap">View</span>
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

/* ---------------- small utils ---------------- */

function normalizeImgUrl(url) {
  if (!url || typeof url !== "string") return "";
  const u = url.trim();

  if (u.startsWith("ipfs://")) {
    const cid = u.replace("ipfs://", "");
    return `https://ipfs.io/ipfs/${cid}`;
  }

  if (u.startsWith("ar://")) {
    const id = u.replace("ar://", "");
    return `https://arweave.net/${id}`;
  }

  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  if (u.includes(".") || u.startsWith("/")) return `https://${u.replace(/^\/+/, "")}`;
  return u;
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
