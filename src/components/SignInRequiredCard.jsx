import React from "react";

export default function SignInRequiredCard({
  title = "Sign in required",
  message = "You must be signed in to manage token authority actions.",
  primaryText = "Sign In",
  secondaryText = "Create Account",
  showSecondary = true,
  loginPath = "/login",
  registerPath = "/register",
}) {
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="w-full max-w-md rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/60 shadow-xl p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm text-white/70">{message}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => (window.location.href = loginPath)}
            className="w-full rounded-xl border border-[#1CEAB9] bg-[#0B0E11] hover:bg-[#0F141A] text-white py-2.5 font-medium"
          >
            {primaryText}
          </button>

          {showSecondary && (
            <button
              onClick={() => (window.location.href = registerPath)}
              className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white py-2.5 font-medium"
            >
              {secondaryText}
            </button>
          )}
        </div>

        <div className="mt-5 text-center text-xs text-white/50">
          This keeps token authority actions protected.
        </div>
      </div>
    </div>
  );
}
