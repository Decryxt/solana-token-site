import { useMemo, useState } from "react";

const FAQS = [
  {
    q: "What is OriginFi?",
    a: "OriginFi is a Solana-focused platform designed to help users create tokens and manage key token settings through a guided interface.",
  },
  {
    q: "Do I need coding experience to use OriginFi?",
    a: "No. OriginFi is designed to be usable without coding knowledge.",
  },
  {
    q: "Which wallets are supported?",
    a: "OriginFi supports Solana wallets compatible with the site’s wallet integration, such as Phantom and Solflare.",
  },
  {
    q: "Does OriginFi have access to my wallet or funds?",
    a: "No. OriginFi never has custody of your wallet or funds. All transactions must be approved in your wallet.",
  },
  {
    q: "What happens after I create a token?",
    a: "Your token will appear in your dashboard where you can view it and manage available settings.",
  },
  {
    q: "Are there fees to use OriginFi?",
    a: "Some actions require SOL for network fees, typically ranging from 0.01–0.05 SOL.",
  },
  {
    q: "Are blockchain transactions refundable?",
    a: "No. Blockchain transactions are final and cannot be reversed.",
  },
  {
    q: "Why don’t some older profile images or banners load?",
    a: "Older images may have been saved with a legacy file URL. Re-uploading updates them to the new assets domain.",
  },
  {
    q: "Can I change my username or profile later?",
    a: "Yes. Profile information can be updated from your account settings.",
  },
  {
    q: "Does OriginFi guarantee token success or value?",
    a: "No. OriginFi provides tools, but token performance and market outcomes are never guaranteed.",
  },
];

function Item({ item, isOpen, onToggle }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 backdrop-blur-md">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-white/5 transition rounded-xl"
      >
        <span className="text-white font-medium text-sm sm:text-base">
          {item.q}
        </span>
        <span className="text-[#1CEAB9] text-xl leading-none select-none">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 text-gray-200/90 text-sm leading-relaxed">
          <div className="h-px w-full bg-white/10 mb-3" />
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [openKey, setOpenKey] = useState(null);

  // Put items into two columns (left/right) on desktop so it feels shorter
  const [left, right] = useMemo(() => {
    const l = [];
    const r = [];
    FAQS.forEach((x, idx) => (idx % 2 === 0 ? l.push(x) : r.push(x)));
    return [l, r];
  }, []);

  return (
    // IMPORTANT: no full-page black background here.
    // Let your site's global theme show through.
    <div className="min-h-[calc(100vh-80px)] px-4 py-10 overflow-x-hidden">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header (compact) */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            FAQ
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-300">
            Quick answers to common questions about OriginFi.
          </p>
        </div>

        {/* Card container (matches theme, not a giant slab) */}
        <div className="rounded-2xl border border-[#1CEAB9]/50 bg-black/30 backdrop-blur-xl shadow-[0_0_0_1px_rgba(28,234,185,0.18)]">
          <div className="p-4 sm:p-6">
            {/* Scroll container so the page doesn't feel huge */}
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              {/* Two columns on lg+ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {left.map((item) => {
                    const key = item.q;
                    return (
                      <Item
                        key={key}
                        item={item}
                        isOpen={openKey === key}
                        onToggle={() => setOpenKey(openKey === key ? null : key)}
                      />
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {right.map((item) => {
                    const key = item.q;
                    return (
                      <Item
                        key={key}
                        item={item}
                        isOpen={openKey === key}
                        onToggle={() => setOpenKey(openKey === key ? null : key)}
                      />
                    );
                  })}
                </div>
              </div>
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
