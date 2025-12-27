import React from "react";

export default function TermsPrivacy() {
  return (
    <div className="max-w-3xl mx-auto p-8 text-left text-white">
      <h1 className="text-4xl font-bold mb-6 text-[#1CEAB9]">Terms & Privacy</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Terms of Service</h2>
        <p className="mb-4">
          By accessing or using OriginFi, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of the terms, you must not use the service.
        </p>
        <p className="mb-4">
          OriginFi provides a platform to create and manage tokens on the Solana blockchain. We are not responsible for the use or misuse of tokens created on our platform.
        </p>
        <p className="mb-4">
          You are responsible for maintaining the security of your wallet credentials and private keys.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Privacy Policy</h2>
        <p className="mb-4">
          OriginFi respects your privacy. We do not sell or share your personal information with third parties except as required by law.
        </p>
        <p className="mb-4">
          We may collect minimal usage data and analytics to improve the platform, but no personal identifying information is collected without your consent.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Contact</h2>
        <p>
          If you have questions about these policies, please contact us at <a href="mailto:OriginFiOfficial@gmail.com" className="text-[#1CEAB9] underline">OriginFiOfficial@gmail.com</a>.
        </p>
      </section>
    </div>
  );
}
