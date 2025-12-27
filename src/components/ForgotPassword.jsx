import { useState } from "react";

export default function ForgotPassword({ setPage }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "If that email exists, a reset link has been sent.");
    } catch {
      setMessage("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-[#0B0E11] border border-[#1CEAB9] rounded-2xl p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-white mb-4 text-center">
        Forgot Password
      </h1>

      <p className="text-gray-400 text-sm text-center mb-6">
        Enter your email and we’ll send you a reset token in the backend logs.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="p-3 rounded bg-[#111418] text-white border border-gray-700 focus:border-[#1CEAB9] outline-none"
          type="email"
          placeholder="your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          className="p-3 bg-[#1CEAB9] text-black font-semibold rounded hover:bg-teal-400 transition"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Token"}
        </button>
      </form>

      {message && (
        <p className="text-[#1CEAB9] mt-4 text-center text-sm">{message}</p>
      )}

      <div className="mt-6 text-xs text-center text-gray-400 space-y-2">
        <button
          className="text-[#1CEAB9] hover:underline block w-full"
          onClick={() => setPage("reset")}
        >
          I already have a reset token
        </button>
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
