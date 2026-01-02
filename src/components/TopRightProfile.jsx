// components/TopRightProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getAuth, saveAuth, clearAuth } from "../authStorage";
import EditProfileModal from "./EditProfileModal";

// Tooltip for badge descriptions
function BadgeTooltip({ text }) {
  return (
    <div
      className="
        absolute left-1/2 -translate-x-1/2 mt-7
        px-3 py-2 bg-black/90 text-white 
        text-[10px] rounded-md border border-[#1CEAB9]/40 
        shadow-lg whitespace-nowrap 
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-200 z-50
      "
    >
      {text}
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) throw new Error("VITE_API_URL is not set");

export default function TopRightProfile({ setPage }) {
  const [showModal, setShowModal] = useState(false);
  const [modalAnimateIn, setModalAnimateIn] = useState(false);
  const [auth, setAuth] = useState(() => getAuth());
  const [formMode, setFormMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  // On mount: read stored auth + refresh /me if token exists
  useEffect(() => {
    const stored = getAuth();

    if (!stored || !stored.token) {
      setAuth(stored || { token: null, user: null });
      console.log("OriginFi auth state (no token):", stored);
      return;
    }

    setAuth(stored);
    console.log("OriginFi auth state (before /me):", stored);

    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/protected/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${stored.token}`,
          },
        });

        const data = await res.json();
        console.log("Fetched /api/protected/me response:", data);

        if (!res.ok) {
          console.error("Failed to fetch /me on load:", data);
          return;
        }
        const updatedAuth = {
          token: stored.token,
          user: data.user,
        };
        saveAuth(updatedAuth.token, updatedAuth.user);
        setAuth(updatedAuth);
        console.log("OriginFi auth state (after /me):", updatedAuth);
      } catch (err) {
        console.error("Error fetching /me on load:", err);
      }
    };

    fetchMe();
  }, []);

  useEffect(() => {
    if (showModal) {
      const t = setTimeout(() => setModalAnimateIn(true), 10);
      return () => clearTimeout(t);
    } else {
      setModalAnimateIn(false);
    }
  }, [showModal]);

  const isLoggedIn = !!auth.token;
  const userEmail = auth.user?.email;

  const userName =
    auth.user?.username ||
    auth.user?.name ||
    (userEmail ? userEmail.split("@")[0] : "OriginFi User");
  const avatarInitial = userName.charAt(0).toUpperCase();
  const avatarUrlRaw = auth.user?.profileImageUrl || null;
  const bannerUrlRaw = auth.user?.bannerImageUrl || null;

  // Cache-bust avatar/banner so updates show instantly (browser caches these URLs aggressively)
  const bustKey = useMemo(() => {
    const u = auth.user?.updatedAt;
    return u ? String(u) : `${avatarUrlRaw || ""}|${bannerUrlRaw || ""}|${Date.now()}`;
  }, [auth.user?.updatedAt, avatarUrlRaw, bannerUrlRaw]);

  const avatarUrl = useMemo(() => {
    if (!avatarUrlRaw) return null;
    return `${avatarUrlRaw}${avatarUrlRaw.includes("?") ? "&" : "?"}v=${encodeURIComponent(bustKey)}`;
  }, [avatarUrlRaw, bustKey]);

  const bannerUrl = useMemo(() => {
    if (!bannerUrlRaw) return null;
    return `${bannerUrlRaw}${bannerUrlRaw.includes("?") ? "&" : "?"}v=${encodeURIComponent(bustKey)}`;
  }, [bannerUrlRaw, bustKey]);

  // Badges from backend
  const badges = auth.user?.badges || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const endpoint =
        formMode === "login" ? "/api/auth/login" : "/api/auth/register";

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (formMode === "register") {
        setFormMode("login");
        setErrorMsg("Account created. Please sign in.");
        setLoading(false);
        return;
      }

      const token = data.token;
      if (!token) throw new Error("No token returned from server");

      // Fetch user with /me (includes badges)
      const profileRes = await fetch(`${API_BASE}/api/protected/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const profileData = await profileRes.json();
      console.log("Fetched /me after login:", profileData);

      if (!profileRes.ok) {
        console.error("Failed to fetch /me after login:", profileData);
      }

      const user = profileData.user || null;

      saveAuth(token, user);
      setAuth({ token, user });
      setShowModal(false);
      setForm({ email: "", password: "" });
      setErrorMsg("");
      setShowProfileCard(false);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    clearAuth();
    setAuth({ token: null, user: null });
    setShowProfileCard(false);
  };

  const toggleProfileCard = () => {
    if (!isLoggedIn) return;
    setShowProfileCard((prev) => !prev);
  };

  return (
    <>
      {/* Top-right avatar / sign-in pill */}
      <div className="fixed top-4 right-4 z-50">
        {!isLoggedIn ? (
          <div className="flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md bg-black/30 border border-[#1CEAB9] shadow-[0_0_20px_rgba(28,234,185,0.3)]">
            <button
              onClick={() => {
                setShowModal(true);
                setFormMode("login");
                setErrorMsg("");
              }}
              className="text-white font-semibold text-sm hover:underline"
            >
              Sign In
            </button>
            <div className="w-8 h-8 rounded-full bg-black border border-[#1CEAB9]/60" />
          </div>
        ) : (
          <div className="relative">
            {/* Avatar button */}
            <button
              onClick={toggleProfileCard}
              className="
                w-9 h-9 rounded-full 
                bg-black border border-[#1CEAB9]/80 
                flex items-center justify-center 
                text-xs font-semibold text-white
                hover:scale-105 hover:border-[#1CEAB9] 
                hover:shadow-[0_0_15px_rgba(28,234,185,0.6)]
                transition-transform transition-shadow overflow-hidden
              "
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarInitial
              )}
            </button>

            {/* Profile card */}
            <div
              className={[
                "absolute right-0 mt-2 w-[420px] rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/50 shadow-xl backdrop-blur-xl overflow-hidden",
                "transform transition-all duration-200 ease-out origin-top-right",
                showProfileCard
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
              ].join(" ")}
            >
              {/* Banner */}
              <div className="relative h-16 w-full">
                {bannerUrl ? (
                  <img
                    src={bannerUrl}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-[#071018] via-[#071b26] to-[#020608]" />
                )}
                {/* Small avatar overlapping */}
                <div className="absolute -bottom-5 left-4 h-10 w-10 rounded-full bg-[#0B0E11] border-2 border-[#0B0E11] flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-[#1CEAB9]">
                      {avatarInitial}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-7 px-6 pb-6 text-xs text-gray-200 space-y-4">
                {/* Name + email */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-white truncate max-w-[180px]">
                      {userName}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate max-w-[220px]">
                      {userEmail || ""}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                      Badges
                    </div>
                    <div className="flex flex-wrap gap-2 pr-2 pt-1">
                      {badges.map((badge) => {
                        let baseClasses =
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] cursor-default";
                        let styleClasses = "";

                        if (badge.rarity === "common") {
                          styleClasses =
                            "bg-[#111]/80 border border-gray-700 text-gray-200 shadow-inner";
                        } else if (badge.rarity === "rare") {
                          styleClasses =
                            "bg-gradient-to-r from-[#1CEAB9]/20 to-[#7b61ff]/20 border border-[#1CEAB9]/50 text-[#1CEAB9] shadow-inner";
                        } else if (badge.rarity === "epic") {
                          styleClasses =
                            "bg-gradient-to-r from-[#1CEAB9]/30 to-[#7b61ff]/40 border border-[#1CEAB9] text-[#e8fdf8] shadow-inner";
                        } else if (badge.rarity === "legendary") {
                          styleClasses =
                            "bg-gradient-to-r from-yellow-300/40 to-orange-400/40 border border-yellow-300 text-black shadow-inner";
                        }

                        return (
                          <div
                            key={badge.id}
                            className={`${baseClasses} ${styleClasses} relative group`}
                          >
                            <span className="text-xs">{badge.icon}</span>
                            <span className="truncate max-w-[120px]">
                              {badge.name}
                            </span>

                            <BadgeTooltip
                              text={`${badge.name} — ${badge.description}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-white/20" />
                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="w-full py-1.5 rounded-lg bg-transparent border border-[#1CEAB9]/60 text-[11px] font-semibold text-[#1CEAB9] hover:bg-[#1CEAB9]/10 transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-1.5 rounded-lg bg-transparent border border-red-500/60 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 transition"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/60 pt-20 pr-6">
          <div
            className="absolute inset-0"
            onClick={() => setShowModal(false)}
          />

          <div
            className={[
              "relative w-full max-w-sm rounded-2xl bg-[#0B0E11] border border-[#1CEAB9]/40 p-6 shadow-xl",
              "transform transition-all duration-200 ease-out",
              modalAnimateIn
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-2 scale-95",
            ].join(" ")}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                {formMode === "login" ? "Sign In" : "Create Account"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/20 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/20 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9]"
                />
              </div>

              {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-[#1CEAB9] via-[#17d1a6] to-[#0bc4a1] text-black font-semibold hover:brightness-110 transition disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : formMode === "login"
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>

            {formMode === "login" && (
              <div className="mt-3 text-xs text-center">
                <button
                  className="text-[#1CEAB9] hover:underline"
                  onClick={() => {
                    setShowModal(false);
                    setForm({ email: "", password: "" });
                    setErrorMsg("");
                    setTimeout(() => {
                      setPage("forgot");
                    }, 150);
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-400 text-center">
              {formMode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    className="text-[#1CEAB9] hover:underline"
                    onClick={() => {
                      setFormMode("register");
                      setErrorMsg("");
                    }}
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    className="text-[#1CEAB9] hover:underline"
                    onClick={() => {
                      setFormMode("login");
                      setErrorMsg("");
                    }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile modal */}
      {showEditProfile && isLoggedIn && (
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          auth={auth}
          setAuth={setAuth}
        />
      )}
    </>
  );
}
