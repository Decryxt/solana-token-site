// src/components/BadgeShowcase.jsx
import React, { useEffect, useState } from "react";
import { getAuth, saveAuth } from "../authStorage";

const API_BASE = import.meta.env.VITE_API_URL;

// Tooltip for full description on hover (optional)
function BadgeTooltip({ text }) {
  return (
    <div
      className="
        absolute left-1/2 -translate-x-1/2 mt-8
        px-3 py-2 bg-black/90 text-white 
        text-[10px] rounded-md border border-[#1CEAB9]/40 
        shadow-lg whitespace-normal 
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-200 z-50
        max-w-xs
      "
    >
      {text}
    </div>
  );
}

// Frontend catalog of all badges
const ALL_BADGES = [
  // ===== Identity / Team =====
  {
    id: "founder",
    name: "Founder",
    rarity: "legendary",
    icon: "👑",
    description: "OriginFi's creator.",
  },
  {
    id: "coFounder",
    name: "Co-Founder",
    rarity: "legendary",
    icon: "🤝",
    description: "Co-founded OriginFi.",
  },
  {
    id: "developer",
    name: "Core Dev",
    rarity: "legendary",
    icon: "🛠️",
    description: "Builds the core OriginFi platform.",
  },
  {
    id: "proCreator",
    name: "Pro Creator",
    rarity: "rare",
    icon: "✨",
    description: "Has an active Pro subscription on OriginFi.",
  },

  // ===== Time / Early Access =====
  {
    id: "genesisUser",
    name: "Genesis User",
    rarity: "epic",
    icon: "🧬",
    description: "One of the earliest OriginFi users.",
  },
  {
    id: "dayOne",
    name: "Day One",
    rarity: "epic",
    icon: "📅",
    description: "Created an account on OriginFi's launch day.",
  },
  {
    id: "yearOne",
    name: "1 Year On OriginFi",
    rarity: "rare",
    icon: "📆",
    description: "Account has been active for at least 1 year.",
  },
  {
    id: "yearTwo",
    name: "2 Years On OriginFi",
    rarity: "epic",
    icon: "⏳",
    description: "Account has been active for at least 2 years.",
  },
  {
    id: "yearThree",
    name: "3+ Years On OriginFi",
    rarity: "legendary",
    icon: "🏛️",
    description: "Account has been active for at least 3 years.",
  },

  // ===== Token Creation =====
  {
    id: "firstMint",
    name: "First Mint",
    rarity: "common",
    icon: "🪙",
    description: "Created your first token on OriginFi.",
  },
  {
    id: "factoryWorker",
    name: "Factory Worker",
    rarity: "common",
    icon: "🏭",
    description: "Created 5 or more tokens.",
  },
  {
    id: "tokenEngineer",
    name: "Token Engineer",
    rarity: "rare",
    icon: "🧪",
    description: "Created 10 or more tokens.",
  },
  {
    id: "launchpadVeteran",
    name: "Launchpad Veteran",
    rarity: "epic",
    icon: "🚀",
    description: "Created 25 or more tokens.",
  },

  // ===== Diversity / DeFi =====
  {
    id: "defiReady",
    name: "DeFi Ready",
    rarity: "rare",
    icon: "🌐",
    description: "Has at least one token with a liquidity pool.",
  },
  {
    id: "themeCrafter",
    name: "Theme Crafter",
    rarity: "rare",
    icon: "🎨",
    description: "Creates tokens with rich metadata and visuals.",
  },

  // ===== Security / Safety =====
  {
    id: "responsibleCreator",
    name: "Responsible Creator",
    rarity: "rare",
    icon: "🧱",
    description: "Revoked mint authority on at least one token.",
  },
  {
    id: "locksmith",
    name: "Locksmith",
    rarity: "epic",
    icon: "🔐",
    description: "Configured advanced authority settings on tokens.",
  },
  {
    id: "transparentDeployer",
    name: "Transparent Deployer",
    rarity: "common",
    icon: "📖",
    description:
      "Provides clear descriptions and links for deployed tokens.",
  },
  {
    id: "riskAware",
    name: "Risk Aware",
    rarity: "common",
    icon: "⚠️",
    description: "Reviewed OriginFi's safety and risk documentation.",
  },

  // ===== Liquidity =====
  {
    id: "poolInitiator",
    name: "Pool Initiator",
    rarity: "common",
    icon: "💧",
    description: "Created or has liquidity for at least one token.",
  },
  {
    id: "deepLiquidity",
    name: "Deep Liquidity",
    rarity: "epic",
    icon: "🌊",
    description:
      "Total liquidity across your tokens reached a strong level.",
  },
  {
    id: "whalePool",
    name: "Whale Pool",
    rarity: "legendary",
    icon: "🐋",
    description:
      "Total liquidity across your tokens reached a massive level.",
  },

  // ===== Trading / Volume =====
  {
    id: "firstTrade",
    name: "First Trade",
    rarity: "common",
    icon: "🔁",
    description: "At least one of your tokens has trading activity.",
  },
  {
    id: "volumeRookie",
    name: "Volume Rookie",
    rarity: "rare",
    icon: "📊",
    description: "Your tokens reached solid cumulative trading volume.",
  },
  {
    id: "volumePro",
    name: "Volume Pro",
    rarity: "epic",
    icon: "📈",
    description: "Your tokens reached high cumulative trading volume.",
  },
  {
    id: "volumeTitan",
    name: "Volume Titan",
    rarity: "legendary",
    icon: "📉",
    description:
      "Your tokens reached extremely large trading volume overall.",
  },
  {
    id: "millionDollarClub",
    name: "Million Dollar Club",
    rarity: "legendary",
    icon: "💎",
    description:
      "Your tokens have hit million-level trading volume on OriginFi.",
  },

  // ===== Holders =====
  {
    id: "first50",
    name: "First 50",
    rarity: "common",
    icon: "👥",
    description: "One of your tokens reached 50 unique holders.",
  },
  {
    id: "hundredStrong",
    name: "Hundred Strong",
    rarity: "rare",
    icon: "👨‍👩‍👧‍👦",
    description: "One of your tokens reached 100 unique holders.",
  },
  {
    id: "communityMagnet",
    name: "Community Magnet",
    rarity: "epic",
    icon: "🧲",
    description: "One of your tokens reached 500 unique holders.",
  },
  {
    id: "thousandTribe",
    name: "Thousand Tribe",
    rarity: "legendary",
    icon: "🏟️",
    description: "One of your tokens reached 1,000 unique holders.",
  },

  // ===== Social / Community (future) =====
  {
    id: "inviter",
    name: "Inviter",
    rarity: "common",
    icon: "📨",
    description: "Invited a new user to OriginFi.",
  },
  {
    id: "networker",
    name: "Networker",
    rarity: "rare",
    icon: "🕸️",
    description: "Referred several active OriginFi users.",
  },
  {
    id: "connector",
    name: "Connector",
    rarity: "epic",
    icon: "🌉",
    description: "Built a strong network of creators.",
  },
  {
    id: "communityBuilder",
    name: "Community Builder",
    rarity: "epic",
    icon: "🏗️",
    description: "Helped grow the OriginFi community.",
  },
  {
    id: "feedbackGiver",
    name: "Feedback Giver",
    rarity: "common",
    icon: "📝",
    description: "Shared feedback to improve OriginFi.",
  },
  {
    id: "bugHunter",
    name: "Bug Hunter",
    rarity: "rare",
    icon: "🔍",
    description: "Reported a valid bug in OriginFi.",
  },
  {
    id: "featureShaper",
    name: "Feature Shaper",
    rarity: "epic",
    icon: "🧠",
    description: "Influenced a shipped OriginFi feature.",
  },
  {
    id: "helper",
    name: "Helper",
    rarity: "common",
    icon: "🆘",
    description: "Helped other users understand OriginFi.",
  },
  {
    id: "communityMod",
    name: "Community Mod",
    rarity: "epic",
    icon: "🛡️",
    description: "Moderates the OriginFi community.",
  },

  // ===== Subscription / Payment (future) =====
  {
    id: "lifetimeMember",
    name: "Lifetime Member",
    rarity: "legendary",
    icon: "♾️",
    description: "Granted lifetime membership on OriginFi.",
  },
  {
    id: "dayOnePro",
    name: "Day One Pro",
    rarity: "epic",
    icon: "💼",
    description: "Subscribed to Pro during the launch period.",
  },
  {
    id: "highRoller",
    name: "High Roller",
    rarity: "epic",
    icon: "🎰",
    description: "Spent a high total amount on OriginFi.",
  },

  // ===== Seasonal / Events (future) =====
  {
    id: "launchSeason1",
    name: "Launch Season 1",
    rarity: "rare",
    icon: "🎯",
    description: "Active during OriginFi Launch Season 1.",
  },
  {
    id: "anniversaryYear1",
    name: "Anniversary Year 1",
    rarity: "rare",
    icon: "🎂",
    description: "Active on the first anniversary of OriginFi.",
  },
  {
    id: "bugBountyS1",
    name: "Bug Bounty S1",
    rarity: "epic",
    icon: "🧷",
    description: "Participated in the first bug bounty event.",
  },
  {
    id: "newYearMint",
    name: "New Year Mint",
    rarity: "rare",
    icon: "🎆",
    description: "Minted a token on New Year's Day.",
  },
  {
    id: "blackFridayDeployer",
    name: "Black Friday Deployer",
    rarity: "rare",
    icon: "🛍️",
    description: "Minted during a Black Friday event.",
  },
  {
    id: "pumpSeason",
    name: "Pump Season",
    rarity: "epic",
    icon: "📯",
    description: "Minted during a Pump Season campaign.",
  },

  // ===== Fun / Meme (future) =====
  {
    id: "degenerate",
    name: "DeFi Degen",
    rarity: "epic",
    icon: "🤪",
    description: "Launched especially degen token setups.",
  },
  {
    id: "diamondHands",
    name: "Diamond Hands",
    rarity: "epic",
    icon: "💎🙌",
    description: "Held through extreme volatility.",
  },
  {
    id: "paperHands",
    name: "Paper Hands",
    rarity: "common",
    icon: "📄🙌",
    description: "Exited positions quickly.",
  },
  {
    id: "spreadsheetWarrior",
    name: "Spreadsheet Warrior",
    rarity: "rare",
    icon: "📑",
    description: "Exports or analyzes token data often.",
  },
  {
    id: "darkModeMaximalist",
    name: "Dark Mode Maximalist",
    rarity: "common",
    icon: "🌚",
    description: "Always uses dark mode on OriginFi.",
  },
  {
    id: "statOverload",
    name: "Stat Overload",
    rarity: "rare",
    icon: "📚",
    description: "Obsessively checks analytics on tokens.",
  },
];

function rarityLabel(r) {
  if (r === "common") return "Common";
  if (r === "rare") return "Rare";
  if (r === "epic") return "Epic";
  if (r === "legendary") return "Legendary";
  return r;
}

export default function BadgeShowcase() {
  const [auth, setAuth] = useState(() => getAuth());
  const userBadges = auth?.user?.badges || [];
  const earnedIds = new Set(userBadges.map((b) => b.id));

  // Optional: refresh /me so badges are up to date
  useEffect(() => {
    const stored = getAuth();
    if (!stored?.token) return;

    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/protected/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${stored.token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("BadgeShowcase /me error:", data);
          return;
        }
        const updated = { token: stored.token, user: data.user || null };
        saveAuth(updated.token, updated.user);
        setAuth(updated);
      } catch (err) {
        console.error("BadgeShowcase fetch /me error:", err);
      }
    };

    fetchMe();
  }, []);

  const sortedBadges = [...ALL_BADGES].sort((a, b) => {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    const ra = rarityOrder[a.rarity] ?? 99;
    const rb = rarityOrder[b.rarity] ?? 99;
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen w-full flex justify-center pt-20 pb-16 px-4">
      <div
        className="
          w-full max-w-5xl 
          bg-[#05070A]/80 
          border-2 border-[#1CEAB9]/80
          rounded-3xl 
          shadow-[0_0_40px_rgba(0,0,0,0.7)]
          p-8 
          max-h-[80vh] 
          flex flex-col
        "
      >
        {/* Header + user summary */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Badge Showcase
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              View every OriginFi badge, how to unlock it, and which ones
              you&apos;ve already earned.
            </p>
          </div>
          {auth?.user && (
            <div className="text-right">
              <div className="text-xs text-gray-400">Signed in as</div>
              <div className="text-sm text-white font-medium">
                {auth.user.username ||
                  auth.user.email?.split("@")[0] ||
                  "OriginFi User"}
              </div>
              <div className="text-[11px] text-[#1CEAB9] mt-1">
                {userBadges.length} badge
                {userBadges.length === 1 ? "" : "s"} earned
              </div>
            </div>
          )}
        </div>

        {/* Rarity legend */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px]">
          <span className="text-gray-400 uppercase tracking-wide">
            Rarity:
          </span>
          <span className="px-2 py-1 rounded-full bg-[#111]/80 border border-gray-700 text-gray-200">
            Common
          </span>
          <span className="px-2 py-1 rounded-full bg-gradient-to-r from-[#1CEAB9]/20 to-[#7b61ff]/20 border border-[#1CEAB9]/50 text-[#1CEAB9]">
            Rare
          </span>
          <span className="px-2 py-1 rounded-full bg-gradient-to-r from-[#1CEAB9]/30 to-[#7b61ff]/40 border border-[#1CEAB9] text-[#e8fdf8]">
            Epic
          </span>
          <span className="px-2 py-1 rounded-full bg-gradient-to-r from-yellow-300/40 to-orange-400/40 border border-yellow-300 text-black">
            Legendary
          </span>
        </div>

        {/* Scrollable badge grid area */}
        <div className="mt-2 flex-1 overflow-y-auto of-scroll pr-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
            {sortedBadges.map((badge) => {
              const earned = earnedIds.has(badge.id);

              let styleClasses = "";
              if (badge.rarity === "common") {
                styleClasses =
                  "bg-[#0C0F14] border border-gray-800 text-gray-200";
              } else if (badge.rarity === "rare") {
                styleClasses =
                  "bg-gradient-to-r from-[#1CEAB9]/15 to-[#7b61ff]/15 border border-[#1CEAB9]/50 text-[#e6fffb]";
              } else if (badge.rarity === "epic") {
                styleClasses =
                  "bg-gradient-to-r from-[#1CEAB9]/20 to-[#7b61ff]/30 border border-[#1CEAB9]/80 text-[#f5fffd]";
              } else if (badge.rarity === "legendary") {
                styleClasses =
                  "bg-gradient-to-r from-yellow-300/30 to-orange-400/40 border border-yellow-300 text-black";
              }

              if (!earned) {
                styleClasses +=
                  " opacity-50 grayscale hover:opacity-80 hover:grayscale-0";
              }

              return (
                <div
                  key={badge.id}
                  className={`
                    group relative rounded-2xl p-3
                    ${styleClasses}
                    transition-transform duration-150 hover:-translate-y-0.5
                  `}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-lg">
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold truncate">
                          {badge.name}
                        </h2>
                        <span className="text-[10px] uppercase tracking-wide text-gray-300">
                          {rarityLabel(badge.rarity)}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-300 mt-0.5">
                        {earned ? (
                          <span className="text-[#1CEAB9] font-medium">
                            Unlocked
                          </span>
                        ) : (
                          <span className="text-gray-400">Locked</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-200 pr-4">
                    {badge.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
