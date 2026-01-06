import { useState } from "react";

const faqs = [
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
    a: "OriginFi supports Solana wallets that are compatible with the wallet integration used on the site, such as Phantom and Solflare.",
  },
  {
    q: "Does OriginFi have access to my wallet or funds?",
    a: "No. OriginFi never has custody of your wallet or funds. All on-chain actions must be explicitly approved in your wallet.",
  },
  {
    q: "What happens after I create a token?",
    a: "After creation, your token will appear in your dashboard where you can view it and use any available management tools.",
  },
  {
    q: "Are there fees to use OriginFi?",
    a: "Actions require SOL in ranges from .01 to .05 SOL.",
  },
  {
    q: "Are blockchain transactions refundable?",
    a: "No. Blockchain transactions are final and cannot be reversed or refunded.",
  },
  {
    q: "Why don’t some older profile images or banners load?",
    a: "Images uploaded before infrastructure upgrades may not load on certain networks. Re-uploading the image updates it to the new domain and resolves the issue.",
  },
  {
    q: "Can I change my username or profile later?",
    a: "Yes. You can update your username and profile information from your account settings.",
  },
  {
    q: "Does OriginFi guarantee token success or value?",
    a: "No. OriginFi provides tools and infrastructure, but token performance and market outcomes are never guaranteed.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white overflow-x-hidden">
      {/* Page header spacing */}
      <div className="pt-16 pb-10">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-center text-gray-400">
            Quick answers to common questions about OriginFi.
          </p>
        </div>
      </div>

      {/* FAQ list */}
      <div className="pb-20">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={i}
                  className="border border-[#1CEAB9]/35 rounded-xl bg-[#0B0E11]"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/5 rounded-xl"
                  >
                    <span className="font-medium">{item.q}</span>
                    <span className="text-[#1CEAB9] text-xl leading-none select-none">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-gray-300">
                      <div className="h-px w-full bg-[#1CEAB9]/15 mb-4" />
                      <p className="leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom helper */}
          <div className="mt-10 text-center text-gray-400 text-sm">
            If you still have questions, check back soon as we continue expanding
            documentation.
          </div>
        </div>
      </div>
    </div>
  );
}
