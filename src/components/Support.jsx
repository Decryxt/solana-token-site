import { FaEnvelope } from "react-icons/fa";

export default function Support() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1CEAB9]/50 bg-black/30 backdrop-blur-xl shadow-[0_0_0_1px_rgba(28,234,185,0.18)] p-6">
        <h1 className="text-2xl font-extrabold text-white text-center">
          Support & Contact
        </h1>

        <p className="mt-2 text-sm text-gray-300 text-center">
          Reach us through the appropriate email below.
        </p>

        {/* Support email */}
        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 flex items-center gap-3">
          <span className="text-xl text-[#1CEAB9]">
            <FaEnvelope />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Support</span>
            <a
              href="mailto:support@originfi.net"
              className="text-white font-semibold hover:text-[#1CEAB9] transition"
            >
              support@originfi.net
            </a>
          </div>
        </div>

        {/* Business email */}
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4 flex items-center gap-3">
          <span className="text-xl text-[#1CEAB9]">
            <FaEnvelope />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">
              Business & Partnerships
            </span>
            <a
              href="mailto:originfi@originfi.net"
              className="text-white font-semibold hover:text-[#1CEAB9] transition"
            >
              originfi@originfi.net
            </a>
          </div>
        </div>

        {/* Security notice */}
        <div className="mt-5 rounded-lg border border-[#1CEAB9]/30 bg-[#1CEAB9]/10 p-3 text-center">
          <p className="text-xs text-gray-100/90">
            Never share your seed phrase or private key.
            <br />
            OriginFi will never ask for it.
          </p>
        </div>
      </div>
    </div>
  );
}
