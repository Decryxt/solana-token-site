import { useState } from "react";

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
    a: "Actions require SOL, typically ranging from 0.01–0.05 SOL.",
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

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#0B0E11] px-4 py-16">
      <div className="w-full max-w-xl bg-[#0B0E11] border-2 border-[#1CEAB9] rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-extrabold text-center text-white mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Quick answers to common questions about OriginFi.
        </p>

        <div className="space-y-4">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="border border-white/10 rounded-md"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition"
                >
                  <span className="text-white font-medium">
                    {item.q}
                  </span>
                  <span className="text-[#1CEAB9] text-xl select-none">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          Never share your seed phrase or private key. OriginFi will never ask for it.
        </div>
      </div>
    </div>
  );
}
