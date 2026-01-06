import { useMemo, useState } from "react";

const SECTIONS = [
  { id: "whitepaper", label: "Whitepaper" },
  { id: "getting-started", label: "Getting Started" },
  { id: "fees", label: "Fees" },
  { id: "security", label: "Security" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

export default function Docs() {
  const [active, setActive] = useState("whitepaper");

  // Update this path to match whatever you name the PDF in /public
  const whitepaperUrl = useMemo(
    () => "/docs/originfi-whitepaper-dec-2025.pdf",
    []
  );

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-10 overflow-x-hidden">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Docs
          </h1>
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
                  <div className="text-xs text-gray-400 mt-1">
                    Choose a topic
                  </div>
                </div>

                <div className="p-2">
                  {SECTIONS.map((s) => {
                    const isActive = active === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActive(s.id)}
                        className={[
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition",
                          isActive
                            ? "bg-[#1CEAB9]/10 text-[#1CEAB9] border border-[#1CEAB9]/30"
                            : "text-gray-200 hover:bg-white/5 border border-transparent",
                        ].join(" ")}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Content */}
              <main className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-md">
                {/* Content header */}
                <div className="px-4 py-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {active === "whitepaper" ? "OriginFi Whitepaper" : "Coming Soon"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {active === "whitepaper"
                        ? "View online or download the PDF."
                        : "This section will be expanded over time."}
                    </div>
                  </div>

                  {/* Actions only for whitepaper */}
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

                {/* Content body */}
                <div className="p-4">
                  {active === "whitepaper" && (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <h2 className="text-white font-semibold text-lg">
                            OriginFi Whitepaper
                        </h2>
                        <p className="mt-2 text-sm text-gray-300">
                            The official OriginFi whitepaper outlines the platform’s vision,
                            architecture, and guiding principles. This document is intended
                            for informational purposes only.
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

                        {/* Optional small preview (locked height) */}
                        <div className="rounded-xl border border-white/10 bg-black/10">
                        <div className="h-[260px] overflow-hidden">
                            <iframe
                            title="OriginFi Whitepaper Preview"
                            src={whitepaperUrl}
                            className="w-full h-full"
                            style={{ border: "none" }}
                            />
                        </div>
                        <div className="px-4 py-2 text-xs text-gray-400 text-center border-t border-white/10">
                            Preview only — open the full document to read
                        </div>
                        </div>
                    </div>
                    )}
                    <div className="text-gray-300 text-sm leading-relaxed">
                      <p className="mb-3">
                        This section is reserved for docs content.
                      </p>
                      <p className="text-gray-400">
                        You can add guides here later (Getting Started, Fees, Security, etc.).
                      </p>
                    </div>
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
