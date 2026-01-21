import { useMemo, useState } from "react";

// ✅ Add nested structure so Docs can “branch” cleanly
const NAV = [
  { id: "whitepaper", label: "Whitepaper" },
  {
    id: "video-guides",
    label: "Video Guides",
    children: [
      { id: "video-guides/token-creation", label: "Token Creation" },
      { id: "video-guides/freeze", label: "Freeze Token Account" },
      { id: "video-guides/thaw", label: "Thaw Token Account" },
      { id: "video-guides/set-authority", label: "Set Authority" },
      { id: "video-guides/revoke-freeze", label: "Revoke Freeze Authority" },
      { id: "video-guides/revoke-mint", label: "Revoke Mint Authority" },
    ],
  },
  {
    id: "getting-started",
    label: "Getting Started",
    children: [
      { id: "getting-started/overview", label: "Overview" },
      { id: "getting-started/wallet", label: "Wallet & Network" },
      { id: "getting-started/mint-flow", label: "Mint Flow" },
    ],
  },
  {
    id: "security",
    label: "Security",
    children: [
      { id: "security/authorities", label: "Authorities Explained" },
      { id: "security/honeypots", label: "Honeypots & Freeze Authority" },
      { id: "security/best-practices", label: "Best Practices" },
    ],
  },
  { id: "fees", label: "Fees" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

// ✅ One guide shown at a time
const VIDEO_GUIDES = {
  "video-guides/token-creation": {
    title: "Token Creation",
    desc: "Create a Solana token on mainnet, upload metadata, and complete the mint flow.",
    src: "https://assets.originfi.net/docs/TokenCreationDemo.mp4",
  },
  "video-guides/freeze": {
    title: "Freeze Token Account",
    desc: "Freeze a specific token account to prevent transfers from that account.",
    // Update to your final working URL (case-sensitive):
    src: "https://assets.originfi.net/docs/FreezeTokenACCDemo.mp4",
  },
  "video-guides/thaw": {
    title: "Thaw Token Account",
    desc: "Restore a frozen token account back to an active state.",
    src: "https://assets.originfi.net/docs/ThawTokenACCDemo.mp4",
  },
  "video-guides/set-authority": {
    title: "Set Authority",
    desc: "Transfer or update authorities to a new wallet address or revoke them permanently.",
    src: "https://assets.originfi.net/docs/SetAuthorityDemo.mp4",
  },
  "video-guides/revoke-freeze": {
    title: "Revoke Freeze Authority",
    desc: "Permanently remove the ability to freeze token accounts (anti-honeypot trust signal).",
    src: "https://assets.originfi.net/docs/RevokeFreeze.mp4",
  },
  "video-guides/revoke-mint": {
    title: "Revoke Mint Authority",
    desc: "Permanently remove the ability to mint additional supply (fixed supply guarantee).",
    src: "https://assets.originfi.net/docs/RevokeMint.mp4",
  },
};

function Chevron({ open }) {
  return (
    <span
      className={[
        "inline-block transition-transform text-gray-400",
        open ? "rotate-90" : "rotate-0",
      ].join(" ")}
    >
      ▶
    </span>
  );
}

export default function Docs() {
  const [active, setActive] = useState("whitepaper");

  // ✅ expanded branches (so you can reuse this pattern everywhere)
  const [expanded, setExpanded] = useState({
    "video-guides": true,
    "getting-started": false,
    security: false,
  });

  const whitepaperUrl = useMemo(() => "/docs/originfi-whitepaper-dec-2025.pdf", []);

  const activeGuide = VIDEO_GUIDES[active] ?? null;

  const headerTitle =
    active === "whitepaper"
      ? "OriginFi Whitepaper"
      : active.startsWith("video-guides")
        ? "Video Guides"
        : "Docs";

  const headerSub =
    active === "whitepaper"
      ? "View online or download the PDF."
      : active.startsWith("video-guides")
        ? "Select a guide from the left to keep this page compact."
        : "Select a section from the left.";

  function toggleBranch(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    // optional: clicking the parent also selects it
    setActive(id);
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-10 overflow-x-hidden">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Docs</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-300">
            Product documentation, guides, and the official OriginFi whitepaper.
          </p>
        </div>

        {/* Container */}
        <div className="rounded-2xl border border-[#1CEAB9]/50 bg-black/30 backdrop-blur-xl shadow-[0_0_0_1px_rgba(28,234,185,0.18)]">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
              {/* Sidebar */}
              <aside className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-md">
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="text-sm font-semibold text-white">Sections</div>
                  <div className="text-xs text-gray-400 mt-1">Choose a topic</div>
                </div>

                <div className="p-2">
                  {NAV.map((item) => {
                    const isBranch = !!item.children?.length;
                    const isOpen = !!expanded[item.id];
                    const isActiveParent =
                      active === item.id || active.startsWith(item.id + "/");

                    if (!isBranch) {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActive(item.id)}
                          className={[
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition",
                            active === item.id
                              ? "bg-[#1CEAB9]/10 text-[#1CEAB9] border border-[#1CEAB9]/30"
                              : "text-gray-200 hover:bg-white/5 border border-transparent",
                          ].join(" ")}
                        >
                          {item.label}
                        </button>
                      );
                    }

                    return (
                      <div key={item.id} className="mb-1">
                        <button
                          type="button"
                          onClick={() => toggleBranch(item.id)}
                          className={[
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between",
                            isActiveParent
                              ? "bg-[#1CEAB9]/10 text-[#1CEAB9] border border-[#1CEAB9]/30"
                              : "text-gray-200 hover:bg-white/5 border border-transparent",
                          ].join(" ")}
                        >
                          <span className="flex items-center gap-2">
                            <Chevron open={isOpen} />
                            {item.label}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="mt-1 ml-6 space-y-1">
                            {item.children.map((child) => {
                              const childActive = active === child.id;
                              return (
                                <button
                                  key={child.id}
                                  type="button"
                                  onClick={() => setActive(child.id)}
                                  className={[
                                    "w-full text-left px-3 py-2 rounded-lg text-xs transition",
                                    childActive
                                      ? "bg-white/5 text-white border border-white/10"
                                      : "text-gray-300 hover:bg-white/5 border border-transparent",
                                  ].join(" ")}
                                >
                                  {child.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </aside>

              {/* Content */}
              <main className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-md">
                {/* Content header */}
                <div className="px-4 py-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{headerTitle}</div>
                    <div className="text-xs text-gray-400 mt-1">{headerSub}</div>
                  </div>

                  {/* Whitepaper actions */}
                  {active === "whitepaper" && (
                    <div className="flex gap-2">
                      <a
                        href={whitepaperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg border border-white/10 text-gray-200 hover:bg-white/5 text-sm transition"
                      >
                        Open in new tab
                      </a>
                      <a
                        href={whitepaperUrl}
                        download
                        className="px-3 py-2 rounded-lg border border-[#1CEAB9]/40 text-[#1CEAB9] hover:bg-[#1CEAB9]/10 text-sm transition"
                      >
                        Download PDF
                      </a>
                    </div>
                  )}
                </div>

                {/* ✅ IMPORTANT: constrain content height so the page doesn’t get crazy long */}
                <div className="p-4 max-h-[72vh] overflow-y-auto">
                  {/* Whitepaper */}
                  {active === "whitepaper" && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <h2 className="text-white font-semibold text-lg">OriginFi Whitepaper</h2>
                        <p className="mt-2 text-sm text-gray-300">
                          The official OriginFi whitepaper outlines the platform’s vision, architecture,
                          and guiding principles. This document is intended for informational purposes only.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <a
                            href={whitepaperUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg border border-white/10 text-gray-200 hover:bg-white/5 transition text-sm"
                          >
                            Read whitepaper
                          </a>

                          <a
                            href={whitepaperUrl}
                            download
                            className="px-4 py-2 rounded-lg border border-[#1CEAB9]/40 text-[#1CEAB9] hover:bg-[#1CEAB9]/10 transition text-sm"
                          >
                            Download PDF
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Guides parent page */}
                  {active === "video-guides" && (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <h2 className="text-white font-semibold text-lg">OriginFi Demo Guides</h2>
                      <p className="mt-2 text-sm text-gray-300">
                        Select a guide from the left. This keeps the Docs page compact and easy to navigate.
                      </p>
                      <p className="mt-2 text-xs text-gray-400">
                        Tip: Filenames are case-sensitive. Match the URL exactly.
                      </p>
                    </div>
                  )}

                  {/* ✅ One selected guide at a time */}
                  {activeGuide && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <h2 className="text-white font-semibold text-lg">{activeGuide.title}</h2>
                        <p className="mt-2 text-sm text-gray-300">{activeGuide.desc}</p>

                        <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                          <video className="w-full" controls preload="metadata">
                            <source src={activeGuide.src} type="video/mp4" />
                          </video>
                        </div>

                        <div className="mt-3 text-xs text-[#1CEAB9]/70">
                          Demo video • Mainnet flow
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Everything else (placeholder pages for now) */}
                  {!activeGuide && active !== "whitepaper" && !active.startsWith("video-guides") && (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <h2 className="text-white font-semibold text-lg">Coming Soon</h2>
                      <p className="mt-2 text-sm text-gray-300">
                        This section is ready for your docs content. You can add sub-branches the same way
                        we did for Video Guides.
                      </p>
                    </div>
                  )}
                </div>
              </main>
            </div>

            <div className="mt-6 text-center text-xs sm:text-sm text-gray-300/80">
              Never share your seed phrase or private key. OriginFi will never ask for it.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
