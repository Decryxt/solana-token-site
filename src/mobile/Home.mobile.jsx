import React from "react";

export default function HomeMobile({
  setPage,
  searchTerm,
  setSearchTerm,
  handleProfileSearch,
  searchLoading,
  searchError,
  searchResults,
  handleProfileClick,
}) {
  return (
    <div className="w-full min-h-screen px-4 pt-6 pb-28 text-white">
      {/* HERO */}
      <div className="flex flex-col items-center text-center">
        <h1
          className="text-4xl font-extrabold tracking-widest select-none"
          style={{ letterSpacing: "0.08em" }}
        >
          Origin<span className="text-[#1CEAB9]">Fi</span>
        </h1>

        <p className="mt-2 text-sm text-[#1CEAB9]/80 italic">
          Purpose. Power. Performance.
        </p>

        <button
          onClick={() => {
            const token = localStorage.getItem("originfi_jwt");
            if (token) setPage("create");
            else setPage("createChoice");
          }}
          className="
            mt-6
            h-12 w-full max-w-xs
            rounded-xl
            border border-[#1CEAB9]
            bg-black
            text-sm font-semibold
            text-white
            shadow-[0_0_12px_rgba(28,234,185,0.35)]
            active:scale-[0.98]
          "
        >
          Start Now
        </button>
      </div>

      {/* SEARCH */}
      <div className="mt-8">
        <form
          onSubmit={handleProfileSearch}
          className="
            flex items-center gap-3
            px-4 py-3
            rounded-2xl
            bg-[rgba(20,20,20,0.55)]
            border border-white/10
            backdrop-blur-xl
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="#ffffff"
            className="w-5 h-5 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
            />
          </svg>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search OriginFi profiles..."
            className="
              flex-1 bg-transparent
              text-sm
              text-white
              placeholder:text-white/40
              focus:outline-none
            "
          />
        </form>

        {/* SEARCH STATUS */}
        {searchLoading && (
          <div className="mt-2 text-xs text-slate-400">Searching...</div>
        )}

        {searchError && (
          <div className="mt-2 text-xs text-red-400">{searchError}</div>
        )}

        {searchResults.length > 0 && (
          <div
            className="
              mt-2
              rounded-2xl
              bg-[rgba(5,7,10,0.95)]
              border border-white/10
              backdrop-blur-xl
              max-h-64
              overflow-y-auto
            "
          >
            {searchResults.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleProfileClick(user)}
                className="
                  w-full
                  flex items-center gap-3
                  px-4 py-3
                  text-left
                  hover:bg-white/5
                "
              >
                <div
                  className="
                    w-9 h-9 rounded-full
                    border border-[#1CEAB9]/40
                    bg-[#12161C]
                    flex items-center justify-center
                    overflow-hidden
                    text-xs font-semibold
                    shrink-0
                  "
                >
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[#1CEAB9]">
                      {(user.username || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {user.username || "No username"}
                  </span>
                  <span className="text-xs text-slate-400">
                    Creator Level{" "}
                    <span className="text-[#1CEAB9] font-semibold">
                      {user.creatorLevel?.label || "Newcomer"}
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VALUE PROPS */}
      <div className="mt-10 grid gap-3">
        {[
          {
            title: "Mint in minutes",
            desc: "Create Solana tokens directly from your phone.",
          },
          {
            title: "SPL + Token-2022",
            desc: "Automatic program detection and support.",
          },
          {
            title: "Authority controls",
            desc: "Revoke, freeze, delegate, close — mobile-ready.",
          },
        ].map((x) => (
          <div
            key={x.title}
            className="rounded-2xl border border-white/10 bg-[#0B0E11] p-4"
          >
            <div className="text-sm font-semibold">{x.title}</div>
            <div className="mt-1 text-xs leading-relaxed text-white/60">
              {x.desc}
            </div>
          </div>
        ))}
      </div>

      {/* TOKEN-2022 NOTE */}
      <div className="mt-8 rounded-2xl border border-[#1CEAB9]/20 bg-[#0B0E11] p-4">
        <div className="text-sm font-semibold">Token-2022 note</div>
        <div className="mt-2 text-xs leading-relaxed text-white/60">
          Some mints may use Token-2022. Certain DEX tools may have limited support.
          Clear warnings will appear before minting.
        </div>
      </div>
    </div>
  );
}
