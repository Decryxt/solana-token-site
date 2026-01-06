import { useState } from "react";

const faqs = [
  {
    q: "What is OriginFi?",
    a: "OriginFi is a Solana-based platform that lets users create, manage, and analyze tokens without coding."
  },
  {
    q: "Do I need coding experience?",
    a: "No. OriginFi is built for non-technical users as well as advanced creators."
  },
  {
    q: "Which wallets are supported?",
    a: "Major Solana wallets such as Phantom and Solflare are supported."
  },
  {
    q: "Does OriginFi control my wallet?",
    a: "No. OriginFi never has custody of your funds. All transactions require wallet approval."
  },
  {
    q: "Are there fees?",
    a: "Some actions require SOL to cover network costs. Advanced features may require a subscription."
  },
  {
    q: "Why don’t some old images load?",
    a: "Images uploaded before infrastructure upgrades may need to be re-uploaded."
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="border border-[#1CEAB9]/40 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-[#11161c]"
              >
                <span className="font-medium">{item.q}</span>
                <span className="text-[#1CEAB9]">
                  {open === i ? "−" : "+"}
                </span>
              </button>

              {open === i && (
                <div className="px-5 pb-4 text-gray-300">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
