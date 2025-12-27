// components/EditProfileModal.jsx
import React, { useEffect, useState } from "react";
import { saveAuth } from "../authStorage";

const API_BASE = import.meta.env.VITE_API_URL;

export default function EditProfileModal({ isOpen, onClose, auth, setAuth }) {
  const [username, setUsername] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bio, setBio] = useState("");
  const [creatorInfo, setCreatorInfo] = useState("");
  const [featuredBadgeIds, setFeaturedBadgeIds] = useState([]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isOpen || !auth?.user) return;

    const u = auth.user;
    setUsername(u.username || "");
    setProfileImageUrl(u.profileImageUrl || "");
    setBannerImageUrl(u.bannerImageUrl || "");
    setBio(u.bio || "");
    setCreatorInfo(u.creatorInfo || "");

    const userBadges = u.badges || [];

    // 🔑 We will ALWAYS key badges by name (string) for stability
    const fromServer = Array.isArray(u.featuredBadgeIds)
      ? u.featuredBadgeIds
      : [];

    const initialFeatured =
      fromServer.length > 0
        ? fromServer
        : userBadges
            .map((b) => b.name)
            .filter((name) => typeof name === "string" && name.length > 0);

    setFeaturedBadgeIds(initialFeatured);
    setErrorMsg("");
    setSuccessMsg("");
  }, [isOpen, auth]);

  if (!isOpen || !auth?.user) return null;

  const avatarInitial =
    (auth.user.username || auth.user.email || "O")[0].toUpperCase();

  const userBadges = auth.user.badges || [];

  // Username validation (same as before)
  const validateUsernameClient = (value) => {
    if (value === "" || value == null) return null;

    const trimmed = value.trim().toLowerCase();

    if (trimmed.length < 3 || trimmed.length > 20) {
      return "Username must be between 3 and 20 characters.";
    }
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      return "Username can only contain letters, numbers, and underscores.";
    }

    const reserved = ["admin", "root", "support", "originfi", "system", "owner"];
    if (reserved.includes(trimmed)) {
      return "That username is reserved. Please choose another.";
    }

    return null;
  };

  const withBase = (relativePath) =>
    relativePath?.startsWith("http")
      ? relativePath
      : `${API_BASE}${relativePath}`;

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !auth?.token) return;

    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(`${API_BASE}/api/protected/upload-avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Failed to upload avatar.");
        return;
      }

      const fullUrl = withBase(data.imageUrl);
      setProfileImageUrl(fullUrl);
      setSuccessMsg("Avatar uploaded. Don't forget to Save Changes.");
    } catch (err) {
      console.error("Avatar upload error:", err);
      setErrorMsg("Something went wrong uploading avatar.");
    }
  };

  const handleBannerFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !auth?.token) return;

    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("banner", file);

    try {
      const res = await fetch(`${API_BASE}/api/protected/upload-banner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Failed to upload banner.");
        return;
      }

      const fullUrl = withBase(data.imageUrl);
      setBannerImageUrl(fullUrl);
      setSuccessMsg("Banner uploaded. Don't forget to Save Changes.");
    } catch (err) {
      console.error("Banner upload error:", err);
      setErrorMsg("Something went wrong uploading banner.");
    }
  };

  // 🔁 Toggle featured badge by NAME
  const toggleFeaturedBadge = (badge) => {
    const name = badge.name;
    if (!name) return;

    setFeaturedBadgeIds((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth?.token) return;

    const usernameError = validateUsernameClient(username);
    if (usernameError) {
      setErrorMsg(usernameError);
      setSuccessMsg("");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/protected/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          username: username.trim() || null,
          profileImageUrl: profileImageUrl.trim() || null,
          bannerImageUrl: bannerImageUrl.trim() || null,
          bio: bio.trim() || null,
          creatorInfo: creatorInfo.trim() || null,
          // ✅ Save the array of badge names
          featuredBadgeIds: featuredBadgeIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to update profile.");
        setSuccessMsg("");
      } else {
        const updatedUser = data.user || null;
        const updatedAuth = { token: auth.token, user: updatedUser };
        setAuth(updatedAuth);
        saveAuth(updatedAuth.token, updatedAuth.user);
        setSuccessMsg("Profile updated!");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setErrorMsg("Something went wrong.");
      setSuccessMsg("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="
          relative 
          w-full 
          max-w-2xl
          rounded-2xl 
          bg-[#0B0E11] 
          border border-[#1CEAB9]/50 
          shadow-[0_0_30px_rgba(28,234,185,0.25)] 
          p-6 md:p-8
        "
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-white text-sm"
        >
          ✕
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-3">
          <div className="text-xl font-extrabold tracking-normal">
            <span className="text-white">Origin</span>
            <span className="text-[#1CEAB9]">Fi</span>
          </div>
        </div>

        {/* Header row: title + tag */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Edit profile</h2>
          <span className="text-[10px] uppercase tracking-wide text-gray-500">
            Creator settings
          </span>
        </div>

        {/* Banner + avatar row (full width) */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1.3fr] gap-4 mb-4">
          {/* Banner preview */}
          <div>
            <div className="w-full h-20 rounded-xl bg-[#050709] border border-[#1CEAB9]/30 overflow-hidden mb-2">
              {bannerImageUrl ? (
                <img
                  src={bannerImageUrl}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-500">
                  Banner preview
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-gray-300">Banner image</span>
              <label className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#1CEAB9]/50 text-[11px] text-[#1CEAB9] cursor-pointer hover:bg-[#1CEAB9]/10 transition">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Avatar + current info */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#0B0E11] border border-[#1CEAB9]/60 flex items-center justify-center overflow-hidden">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-[#1CEAB9]">
                  {avatarInitial}
                </span>
              )}
            </div>
            <div className="flex-1 text-xs text-gray-300">
              <div className="font-semibold text-white">
                {auth.user.username || auth.user.email}
              </div>
              <div className="text-gray-400 text-[11px]">
                {auth.user.email}
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-gray-300">
                  Avatar image
                </span>
                <label className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#1CEAB9]/50 text-[11px] text-[#1CEAB9] cursor-pointer hover:bg-[#1CEAB9]/10 transition">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Main form: two columns */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2"
        >
          {/* LEFT COLUMN */}
          <div className="space-y-3">
            {/* Username */}
            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Username
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/30 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9] text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
              />
              <p className="mt-1 text-[10px] text-gray-500">
                3–20 characters, letters/numbers/underscores only. Lowercase is
                automatic.
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Bio / creator overview
              </label>
              <textarea
                className="w-full px-3 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/30 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9] text-xs min-h-[80px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people who you are, what you build, and what to expect from your tokens."
              />
            </div>

            {/* Creator info */}
            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Creator info (optional)
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/30 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9] text-xs"
                value={creatorInfo}
                onChange={(e) => setCreatorInfo(e.target.value)}
                placeholder="Tagline, focus (e.g. meme coins, utility tokens, launchpad creator, etc.)"
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-3">
            {/* Featured badges selector */}
            {userBadges.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-300">
                    Featured badges
                  </label>
                  <span className="text-[10px] text-gray-500">
                    Choose which badges appear on your public profile.
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1 border border-[#1CEAB9]/20 rounded-lg bg-[#050709] p-2">
                  {userBadges.map((badge) => {
                    const name = badge.name;
                    if (!name) return null;

                    const active = featuredBadgeIds.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleFeaturedBadge(badge)}
                        title={
                          badge.description
                            ? `${badge.name} — ${badge.description}`
                            : badge.name
                        }
                        className={`flex items_center gap-1 px-2 py-1 rounded-full text-[10px] border ${
                          active
                            ? "border-[#1CEAB9] bg-[#1CEAB9]/15 text-[#1CEAB9]"
                            : "border-[#1CEAB9]/30 bg-black text-gray-300"
                        }`}
                      >
                        <span className="text-[11px]">
                          {badge.icon || "★"}
                        </span>
                        <span className="truncate max-w-[90px]">
                          {badge.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Profile image URL */}
            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Profile image URL (optional)
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/30 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9] text-sm"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="Or paste an image URL"
              />
            </div>

            {/* Banner image URL */}
            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Banner image URL (optional)
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-[#12161C] text-white border border-[#1CEAB9]/30 focus:outline-none focus:ring-2 focus:ring-[#1CEAB9] text-sm"
                value={bannerImageUrl}
                onChange={(e) => setBannerImageUrl(e.target.value)}
                placeholder="Or paste an image URL"
              />
            </div>
          </div>

          {/* Full-width bottom: messages + button */}
          <div className="md:col-span-2">
            {errorMsg && (
              <p className="text-xs text-red-400 mt-1">{errorMsg}</p>
            )}
            {successMsg && (
              <p className="text-xs text-emerald-400 mt-1">{successMsg}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-3 py-2 rounded-lg bg-gradient-to-r from-[#1CEAB9] via-[#17d1a6] to-[#0bc4a1] text-black font-semibold hover:brightness-110 transition disabled:opacity-60 text-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
