import { useEffect, useState } from "react";

export default function ResetPassword({ setPage }) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Pull token from URL once
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") || "";
    if (t) setToken(t);
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) return setMessage("Missing reset token. Please request a new link.");
    if (password.length < 8) return setMessage("Password must be at least 8 characters.");
    if (password !== confirm) return setMessage("Passwords do not match.");

    setLoading(true);
    const API_BASE = import.meta.env.VITE_API_URL;

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.message || "Reset link is invalid or expired. Request a new one.");
      } else {
        setMessage("Password reset successful. You can now log in.");
        // Optional: send them home or to login flow
        // setTimeout(() => setPage("home"), 900);
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0B0E11] border border-[#1CEAB9] rounded-2xl p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-white mb-4 text-center">
        Reset Password
      </h1>

      <p className="text-gray-400 text-sm text-center mb-6">
        Choose a new password for your account.
      </p>

      <form onSubmit={handleReset} className="flex flex-col gap-4">
        {/* Hidden-ish token field (optional) */}
        <input
          className="p-3 rounded bg-[#111418] text-white border border-gray-700 focus:border-[#1CEAB9] outline-none"
          type="text"
          placeholder="reset token (auto-filled from link)..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <input
          className="p-3 rounded bg-[#111418] text-white border border-gray-700 focus:border-[#1CEAB9] outline-none"
          type="password"
          placeholder="new password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          className="p-3 rounded bg-[#111418] text-white border border-gray-700 focus:border-[#1CEAB9] outline-none"
          type="password"
          placeholder="confirm password..."
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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

      <div className="mt-6 text-xs text-center text-gray-400 space-y-2">
        <button
          className="text-[#1CEAB9] hover:underline block w-full"
          onClick={() => setPage("forgot")}
        >
          Request a new reset link
        </button>
        <button className="hover:underline" onClick={() => setPage("home")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
