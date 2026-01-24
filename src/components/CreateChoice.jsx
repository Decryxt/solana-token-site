import React from "react";

export default function CreateChoice({ setPage }) {
  const goGuest = () => {
    localStorage.setItem("originfi_session_mode", "guest");
    setPage("create");
  };

  const goAccount = () => {
    // Optional: if you want to remember where to return after login
    localStorage.setItem("originfi_post_auth_redirect", "create");
    setPage("community"); 
    // Replace this with your actual login/register page when you add it.
    // If you already have a login page state, use that instead (ex: setPage("login")).
  };

  return (
    <div className="pt-40 w-full flex flex-col items-center px-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-white">
            Choose how I want to continue
          </h2>
          <p className="mt-3 text-white/70">
            I can mint instantly as a guest, or create an account to manage everything long-term.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest card */}
          <div className="rounded-2xl border border-[#1CEAB9]/70 bg-[rgba(0,0,0,0.65)] backdrop-blur-xl p-7 shadow-[0_0_25px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Continue as Guest</h3>
                <p className="mt-1 text-white/70">
                  Fastest path to mint.
                </p>
              </div>
              <div className="text-[11px] px-3 py-1 rounded-full border border-white/10 text-white/80">
                No account
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-white/80 text-sm">
              <li>• Mint a token immediately</li>
              <li>• No email or password</li>
              <li>• Try OriginFi before committing</li>
            </ul>

            <button
              onClick={goGuest}
              className="
                mt-7 w-full
                px-6 py-3
                border-2 border-[#1CEAB9]
                bg-black text-white font-semibold rounded-xl
                transform transition duration-300
                hover:scale-[1.02]
                hover:shadow-[0_0_15px_#1CEAB9]
                focus:outline-none
              "
            >
              Continue as Guest
            </button>

            <p className="mt-3 text-xs text-white/50">
              I can create an account later if I want saved history and dashboards.
            </p>
          </div>

          {/* Account card */}
          <div className="rounded-2xl border border-white/10 bg-[rgba(0,0,0,0.65)] backdrop-blur-xl p-7 shadow-[0_0_25px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Create an Account</h3>
                <p className="mt-1 text-white/70">
                  Best for managing tokens long-term.
                </p>
              </div>
              <div className="text-[11px] px-3 py-1 rounded-full border border-white/10 text-white/80">
                Recommended
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-white/80 text-sm">
              <li>• Saved token history & dashboards</li>
              <li>• Profile + creator reputation</li>
              <li>• Easier support & recovery</li>
            </ul>

            <button
              onClick={goAccount}
              className="
                mt-7 w-full
                px-6 py-3
                bg-[#1CEAB9] text-black font-semibold rounded-xl
                transform transition duration-300
                hover:scale-[1.02]
                hover:opacity-95
                focus:outline-none
              "
            >
              Sign up / Log in
            </button>

            <p className="mt-3 text-xs text-white/50">
              I’ll come back to token creation after I sign in.
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setPage("home")}
            className="text-sm text-white/60 hover:text-white transition"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
