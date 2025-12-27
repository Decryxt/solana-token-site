import React, { useRef, useEffect, useState } from "react";

import {
  Rocket,
  Wallet,
  Users,
  XCircle,
  TestTube,
  Paintbrush,
  FileText,
  Terminal,
  Info,
  Settings,
  ShieldCheck,
  Smartphone,
  BookOpen,
  User,
  BarChart3,
  LayoutDashboard,
  UserCircle2,
  Flame,
  Upload,
  BadgeCheck,
  Megaphone,
  Globe,
  Zap,
  Star,
  Layers3,
  Palette,
} from "lucide-react";

const PHASE_STATUS_ICONS = {
  completed: (
    <svg
      className="w-6 h-6 text-green-500 mr-3 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  inProgress: (
    <svg
      className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  incomplete: (
    <svg
      className="w-6 h-6 text-gray-500 mr-3 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
    </svg>
  ),
};

const ITEM_ICONS = {
  mint: <Rocket size={18} className="text-cyan-400 mr-2" />,
  wallet: <Wallet size={18} className="text-yellow-400 mr-2" />,
  revoke: <XCircle size={18} className="text-red-500 mr-2" />,
  test: <TestTube size={18} className="text-indigo-400 mr-2" />,
  deploy: <Flame size={18} className="text-purple-400 mr-2" />,
  community: <Users size={18} className="text-pink-400 mr-2" />,
  ui: <Paintbrush size={18} className="text-blue-400 mr-2" />,
  form: <FileText size={18} className="text-teal-400 mr-2" />,
  button: <Terminal size={18} className="text-purple-400 mr-2" />,
  info: <Info size={18} className="text-white mr-2" />,
  settings: <Settings size={18} className="text-gray-400 mr-2" />,
  terms: <FileText size={18} className="text-gray-500 mr-2" />,
  tx: <Zap size={18} className="text-green-400 mr-2" />,
  faq: <Info size={18} className="text-blue-300 mr-2" />,
  connect: <Wallet size={18} className="text-yellow-300 mr-2" />,
  support: <Users size={18} className="text-pink-300 mr-2" />,
  dashboard: <LayoutDashboard size={18} className="text-purple-300 mr-2" />,
  palette: <Palette size={18} className="text-emerald-300 mr-2" />,
  metadata: <Upload size={18} className="text-orange-300 mr-2" />,
  docs: <BookOpen size={18} className="text-green-300 mr-2" />,
  bug: <XCircle size={18} className="text-red-300 mr-2" />,
  mobile: <Smartphone size={18} className="text-blue-300 mr-2" />,
  shield: <ShieldCheck size={18} className="text-green-500 mr-2" />,
  guide: <BookOpen size={18} className="text-indigo-300 mr-2" />,
  user: <User size={18} className="text-cyan-500 mr-2" />,
  analytics: <BarChart3 size={18} className="text-fuchsia-300 mr-2" />,
  profile: <UserCircle2 size={18} className="text-teal-300 mr-2" />,
  featured: <Star size={18} className="text-yellow-300 mr-2" />,
  device: <Smartphone size={18} className="text-blue-400 mr-2" />,
  outreach: <Megaphone size={18} className="text-pink-300 mr-2" />,
  integration: <Globe size={18} className="text-indigo-400 mr-2" />,
  nft: <Layers3 size={18} className="text-violet-300 mr-2" />,
  launchpad: <Flame size={18} className="text-orange-400 mr-2" />,
  mobileApp: <Smartphone size={18} className="text-green-400 mr-2" />,
  growth: <BarChart3 size={18} className="text-lime-300 mr-2" />,
  partnership: <Globe size={18} className="text-blue-300 mr-2" />,
  dashboardPro: <LayoutDashboard size={18} className="text-amber-400 mr-2" />,
  badge: <BadgeCheck size={18} className="text-purple-300 mr-2" />,
};


export default function Roadmap() {
  const scrollRef = React.useRef(null);
  const scrollbarRef = React.useRef(null);
  const [scrollPos, setScrollPos] = React.useState(0);

  React.useEffect(() => {
    const scrollEl = scrollRef.current;
    const scrollbarEl = scrollbarRef.current;

    if (!scrollEl || !scrollbarEl) return;

    const onScroll = () => {
      const scrollWidth = scrollEl.scrollWidth - scrollEl.clientWidth;
      const scrollPercent = scrollEl.scrollLeft / scrollWidth;
      scrollbarEl.value = scrollPercent * 100;
      setScrollPos(scrollPercent);
    };

    scrollEl.addEventListener("scroll", onScroll);
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, []);

  const onScrollbarChange = (e) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const scrollWidth = scrollEl.scrollWidth - scrollEl.clientWidth;
    const val = e.target.value;
    scrollEl.scrollLeft = (val / 100) * scrollWidth;
  };

  return (
    <section
      className="mx-auto rounded-md shadow-lg roadmap-container"
      style={{
        width: "1080px",
        height: "75vh",
        marginTop: "calc((100vh - 75vh) / 2)", // vertically center
        marginBottom: "calc((100vh - 75vh) / 2)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000000",
        position: "relative",
        outline: "none",
        boxShadow: "0 0 20px #1ceab9",
        animation: "pulseGlow 3s ease-in-out infinite",
        borderRadius: "8px",
      }}
    >
      <h2 className="text-4xl font-semibold mb-6 text-center select-none text-green-400 drop-shadow-lg">
        OriginFi Roadmap
      </h2>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex space-x-10 overflow-x-auto"
        style={{
          height: "calc(75vh - 4rem - 24px)", // leave space for title + scrollbar
          scrollbarWidth: "none", // hide native scrollbar Firefox
          msOverflowStyle: "none", // hide native scrollbar IE/Edge
        }}
      >
        {/* Hide native scrollbar for WebKit */}
        <style>{`
  div::-webkit-scrollbar {
    display: none;
  }

  /* Range slider styles */
  .custom-scrollbar {
    -webkit-appearance: none;
    width: 100%;
    height: 6px; /* thinner track */
    border-radius: 10px;
    background: #111;
    cursor: pointer;
  }
  .custom-scrollbar::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px; /* smaller */
    height: 14px;
    background: #1ceab9;
    border-radius: 50%;
    box-shadow:
      0 0 4px rgba(28, 234, 185, 0.7),
      0 0 8px rgba(28, 234, 185, 0.5);
    animation: pulseThumb 3s ease-in-out infinite;
    border: none;
    margin-top: -4px; /* center on track */
  }
  .custom-scrollbar::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #1ceab9;
    border-radius: 50%;
    box-shadow:
      0 0 4px rgba(28, 234, 185, 0.7),
      0 0 8px rgba(28, 234, 185, 0.5);
    animation: pulseThumb 3s ease-in-out infinite;
    border: none;
  }

  /* Neon pulsing outline animation */
  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 8px rgba(28, 234, 185, 0.4), 0 0 10px rgba(28, 234, 185, 0.3);
    }
    50% {
      box-shadow: 0 0 12px rgba(28, 234, 185, 0.5), 0 0 15px rgba(28, 234, 185, 0.4);
    }
  }

  /* Pulsing thumb animation */
  @keyframes pulseThumb {
    0%, 100% {
      box-shadow:
        0 0 4px rgba(28, 234, 185, 0.7),
        0 0 8px rgba(28, 234, 185, 0.5);
    }
    50% {
      box-shadow:
        0 0 6px rgba(28, 234, 185, 0.6),
        0 0 10px rgba(28, 234, 185, 0.4);
    }
  }
`}</style>

<Phase
  status="completed"
  title="Phase 1: Initial Launch"
  items={[
    { icon: ITEM_ICONS.mint, text: "Token creation & minting functionality" },
    { icon: ITEM_ICONS.wallet, text: "Wallet connection & SOL payment integration" },
    { icon: ITEM_ICONS.community, text: "Community section providing OriginFi's associated socials" },
    { icon: ITEM_ICONS.revoke, text: "Token management: revoke mint, freeze, burn" },
    { icon: ITEM_ICONS.test, text: "SPL Token minting on Devnet for testing" },
    { icon: ITEM_ICONS.ui, text: "Clean, smooth, modern UI featuring gradient themes" },
    { icon: ITEM_ICONS.form, text: "Build token creation form UI with validation" },
    { icon: ITEM_ICONS.button, text: "Implement mint button with loading & interactive feedback" },
    { icon: ITEM_ICONS.info, text: "About section with OriginFi's goal and purpose" },
    { icon: ITEM_ICONS.settings, text: "Basic Settings section with network and theme toggle" },
    { icon: ITEM_ICONS.terms, text: "Standard Terms and Privacy implementing OriginFi's regulations" },
  ]}
/>

<Phase
  status="inProgress"
  title="Phase 2: User Empowerment"
  items={[
    { icon: ITEM_ICONS.tx, text: "Improve minting flow & transaction confirmations" },
    { icon: ITEM_ICONS.faq, text: "Implement FAQ section to address most asked questions" },
    { icon: ITEM_ICONS.connect, text: "Test wallet connection across multiple wallet providers" },
    { icon: ITEM_ICONS.support, text: "Provide basic Support section to solve occuring problems" },
    { icon: ITEM_ICONS.dashboard, text: "Create Token Dashboard displaying basic analytics and created tokens" },
    { icon: ITEM_ICONS.settings, text: "Improved and extended Settings section" },
    { icon: ITEM_ICONS.palette, text: "More themes to fit your desires" },
    { icon: ITEM_ICONS.metadata, text: "Extended Token Metadata featuring logo, description and more" },
  ]}
/>

<Phase
  status="incomplete"
  title="Phase 3: Production Hardening"
  items={[
    { icon: ITEM_ICONS.docs, text: "Develop Docs page corresponding to OriginFi" },
    { icon: ITEM_ICONS.bug, text: "Bug fixes and UX improvements" },
    { icon: ITEM_ICONS.mobile, text: "Finalize mobile layout, compatibility, and responsiveness across devices" },
    { icon: ITEM_ICONS.shield, text: "Security review and apply improvements" },
    { icon: ITEM_ICONS.guide, text: "Develop walkthroughs and guides for token scaling" },
  ]}
/>

<Phase
  status="incomplete"
  title="Phase 4: Network Growth & Engagement"
  items={[
    { icon: ITEM_ICONS.user, text: "Implement user account creation and login system" },
    { icon: ITEM_ICONS.profile, text: "Introduce user profile pages to manage created tokens" },
    { icon: ITEM_ICONS.featured, text: "Add featured tokens section to highlight recent or popular mints" },
    { icon: ITEM_ICONS.device, text: "Finalize full OriginFi user experience across all devices" },
    { icon: ITEM_ICONS.outreach, text: "Expand community outreach via social platforms and creator campaigns" },
    { icon: ITEM_ICONS.integration, text: "Begin work on OriginFi partner integrations and team expansion" },
    { icon: ITEM_ICONS.nft, text: "NFT-style minting extensions or utilities" },
    { icon: ITEM_ICONS.analytics, text: "Advanced analytics for token activity" },
    { icon: ITEM_ICONS.launchpad, text: "Open launchpad system for verified tokens" },
  ]}
/>

<Phase
  status="incomplete"
  title="Phase 5: Long-Term Scale & Innovation"
  items={[
    { icon: ITEM_ICONS.mobileApp, text: "Launch dedicated mobile app (iOS & Android)" },
    { icon: ITEM_ICONS.growth, text: "Scale community through active marketing and creator support" },
    { icon: ITEM_ICONS.partnership, text: "Expand strategic crypto and DeFi partnerships" },
    { icon: ITEM_ICONS.dashboardPro, text: "Develop full-featured OriginFi dashboard with advanced token tools" },
    { icon: ITEM_ICONS.badge, text: "Introduce verified creator badges and recognition system" },
  ]}
/>
      </div>

      {/* Custom horizontal scrollbar */}
      <input
        type="range"
        min="0"
        max="100"
        ref={scrollbarRef}
        onChange={onScrollbarChange}
        className="custom-scrollbar mt-4"
        aria-label="Roadmap horizontal scroll"
      />
    </section>
  );
}

function Phase({ status, title, items }) {
  const statusMap = {
    completed: {
      icon: PHASE_STATUS_ICONS.completed,
      label: "Completed",
      color: "bg-green-600",
      borderColor: "border-green-500",
    },
    inProgress: {
      icon: PHASE_STATUS_ICONS.inProgress,
      label: "In Progress",
      color: "bg-yellow-500",
      borderColor: "border-yellow-500",
    },
    incomplete: {
      icon: PHASE_STATUS_ICONS.incomplete,
      label: "Incomplete",
      color: "bg-gray-600",
      borderColor: "border-gray-600",
    },
  };

  const s = statusMap[status] || statusMap.incomplete;

  return (
    <div
      className={`border-l-4 ${s.borderColor} pl-6 flex-shrink-0`}
      style={{ minWidth: 280 }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center text-xl font-semibold text-gray-200">
          {s.icon}
          {title}
        </div>
        <span
          className={`text-sm ${s.color} px-3 py-1 rounded-full uppercase font-medium select-none ml-4`}
        >
          {s.label}
        </span>
      </div>

      <ul className="space-y-3 text-gray-300">
        {items.map(({ icon, text }, i) => (
          <li key={i} className="flex items-center">
            {icon}
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
