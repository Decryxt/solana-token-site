import { useMemo, useState } from "react";

const FAQS = [
  {
    q: "What is OriginFi?",
    a: "OriginFi is a Solana-focused platform designed to help users create tokens and manage key token settings through a guided interface.",
  },
  {
    q: "Do I need coding experience to use OriginFi?",
    a: "No. OriginFi is designed to be usable without coding knowledge, while still offering tools for more advanced users.",
  },
  {
    q: "Which wallets are supported?",
    a: "OriginFi supports Solana wallets that are compatible with the wallet integration used on the site (commonly Phantom and Solflare).",
  },
  {
    q: "Does OriginFi have access to my wallet or funds?",
    a: "No. OriginFi never has custody of your funds. Any on-chain action requires explicit approval in your wallet.",
  },
  {
    q: "What happens after I create a token?",
    a: "After creation, your token appears in your dashboard where you can view it and use any available management tools.",
  },
  {
    q: "Are there fees to use OriginFi?",
    a: "Actions require SOL ranging in prices from .01 - .05 SOL.",
  },
  {
    q: "Are blockchain transactions refundable?",
    a: "No. Blockchain transactions are final and cannot be reversed or refunded.",
  },
  {
    q: "Why don’t some older profile images or banners load?",
    a: "Some older images were saved with a legacy file URL that may fail on certain networks. Re-uploading updates it to the new assets domain.",
  },
  {
    q: "Can I change my username or profile later?",
    a: "Yes. You can update your profile from selecting your profile picture.",
  },
  {
    q: "Does OriginFi guarantee token success or value?",
    a: "No. OriginFi provides tools and infrastructure, but token performance and market outcomes are never guaranteed.",
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 backdrop-blur-md">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/5 rounded-xl"
      >
        <span className="text-sm sm:text-base font-medium text-white">
          {item.q}
        </span>
        <span className="text-[#1CEAB9] text-xl leading-none select-none">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 text-sm sm:text-base text-gray-200/90">
          <div className="h-px w-full bg-white/10 mb-4" />
          <p className="leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Make it feel shorter: show fewer by default, with an option to expand
  const visibleFaqs = useMemo(() => {
    if (showAll) return FAQS;
    return FAQS.slice(0, 8);
  }, [showAll]);

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      {/* THEME BACKDROP (matches your site vibe instead of solid black slab) */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#0B0E11]" />
        <div className="absolute inset-0 opacity-90 bg-[radial-gradient(800px_500px_at_15%_30%,rgba(28,234,185,0.22),transparent_60%),radial-gradient(900px_600px_at_85%_25%,rgba(0,180,255,0.20),transparent_60%),radial-gradient(900px_700px_at_50%_90%,rgba(140,90,255,0.12),transparent_60%)]" />
        <div className="absolute inset-0 pointer-events-none [mask-image:linear-gradient(to_bottom,black,black_70%,transparent)] opacity-70" />

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          {/* Header (tighter) */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-300">
              Quick answers about OriginFi, wallets, fees, and common issues.
            </p>
          </div>

          {/* Glass container instead of giant black rectangle */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_0_0_1px_rgba(28,234,185,0.15)]">
            <div className="p-4 sm:p-6">
              {/* Two-column on desktop = feels shorter */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {visibleFaqs.map((item, i) => (
                  <FaqItem
                    key={item.q}
                    item={item}
                    isOpen={open === i}
                    onToggle={() => setOpen(open === i ? null : i)}
                  />
                ))}
              </div>

              {/* Expand/collapse */}
              <div className="mt-6 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="px-4 py-2 rounded-lg border border-[#1CEAB9]/40 text-[#1CEAB9] hover:bg-[#1CEAB9]/10 transition"
                >
                  {showAll ? "Show less" : "Show more"}
                </button>
              </div>

              {/* Footer note */}
              <div className="mt-6 text-center text-xs sm:text-sm text-gray-300/80">
                Never share your seed phrase or private key. OriginFi will never ask for it.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
