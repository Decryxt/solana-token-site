import { useState } from "react";

export default function ResetPassword({ setPage }) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      setMessage(data.message || data.error || "Something happened.");
    } catch {
      setMessage("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-[#0B0E11] border border-[#1CEAB9] rounded-2xl p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-white mb-4 text-center">
        Reset Password
      </h1>

      <p className="text-gray-400 text-sm text-center mb-6">
        Paste your reset token from the backend and choose a new password.
      </p>

      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <input
          className="p-3 rounded bg-[#111418] text-white border border-gray-700 focus:border-[#1CEAB9] outline-none"
          type="text"
          placeholder="reset token..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />

        <input
          className="p-3 rounded bg-[#111418] text-white border border-gray-700 focus:border-[#1CEAB9] outline-none"
          type="password"
          placeholder="new password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="p-3 bg-[#1CEAB9] text-black font-semibold rounded hover:bg-teal-400 transition"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {message && (
        <p className="text-[#1CEAB9] mt-4 text-center text-sm">{message}</p>
      )}

      <div className="mt-6 text-xs text-center text-gray-400">
        <button
          className="hover:underline"
          onClick={() => setPage("home")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
