import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { FaTimes, FaCheckCircle, FaRegCircle, FaSpinner, FaCopy, FaExternalLinkAlt } from "react-icons/fa";
import { mintTokenShared } from "../utils/mintToken.mobile";

export default function TokenCreationFormMobile({ onBack }) {
  const wallet = useWallet();

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    decimals: 9,
    supply: "",
    description: "",
    imageURI: "",
    imageFile: null,
    makeMetadataImmutable: false,
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);

  const setStatusMessage = (msg) => {
    setStatus(String(msg || ""));
    setStatusOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imageFile") {
      if (files && files[0]) {
        const url = URL.createObjectURL(files[0]);
        setFormData((prev) => ({
          ...prev,
          imageURI: url,
          imageFile: files[0],
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setStatusOpen(false);

    try {
      setLoading(true);

      await mintTokenShared({
        wallet,
        formData,
        onStatus: setStatusMessage,
      });

      // Keep the same UX pattern: alert after success (optional)
      // If you want NO alert on mobile, remove these.
      const last = String(status || "");
      const mint = (last.match(/Mint:\s*([A-Za-z0-9]{32,})/i) || [])[1] || "";
      alert(`Token minted.\nMint: ${mint || "See console"}\n`);
    } catch (err) {
      console.error("Mobile mint flow error:", err);
      setStatusMessage(err?.message || "Unexpected error while creating token. Check console.");
      alert(err?.message || "Unexpected error while creating token. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 pb-24 pt-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-xl border border-[#1CEAB9]/40 px-3 py-2 text-sm text-white hover:border-[#1CEAB9]/70"
        >
          Back
        </button>

        <div className="text-center">
          <div className="text-base font-semibold text-white">Token Creation</div>
          <div className="text-xs text-white/50">Mobile</div>
        </div>

        <div className="w-[64px]" />
      </div>

      {/* Outer wrapper clips black */}
      <div className="rounded-2xl border border-[#1CEAB9]/35 overflow-hidden">
        {/* Inner surface: black stays inside */}
        <div className="bg-[#0B0E11] p-4 text-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Token Name">
              <input
                name="name"
                type="text"
                placeholder="e.g. OriginFi"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-[#1CEAB9]/60"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Symbol">
                <input
                  name="symbol"
                  type="text"
                  placeholder="e.g. ORFI"
                  required
                  value={formData.symbol}
                  onChange={(e) =>
                    handleChange({
                      ...e,
                      target: { ...e.target, value: e.target.value.toUpperCase() },
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-[#1CEAB9]/60"
                />
              </Field>

              <Field label="Decimals">
                <input
                  name="decimals"
                  type="number"
                  min="0"
                  max="18"
                  value={formData.decimals}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-[#1CEAB9]/60"
                />
              </Field>
            </div>

            <Field label="Total Supply">
              <input
                name="supply"
                type="number"
                placeholder="e.g. 1000000"
                required
                value={formData.supply}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-[#1CEAB9]/60"
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                placeholder="Describe your token..."
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-[#1CEAB9]/60"
              />
            </Field>

            <Field label="Logo (tap to upload)">
              <label
                htmlFor="imageFileInputMobile"
                className="cursor-pointer w-full rounded-xl border border-white/10 bg-black/20 p-3 flex items-center justify-center"
              >
                {formData.imageURI ? (
                  <img
                    src={formData.imageURI}
                    alt="Selected logo"
                    className="max-h-28 object-contain rounded"
                  />
                ) : (
                  <span className="text-sm text-white/70">Tap to select logo image</span>
                )}

                <input
                  id="imageFileInputMobile"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </Field>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.makeMetadataImmutable}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      makeMetadataImmutable: e.target.checked,
                    }))
                  }
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-semibold">Make metadata immutable</div>
                  <div className="text-xs text-white/50 mt-1">
                    Locks name, symbol, image, and description permanently. Irreversible.
                  </div>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-[#1CEAB9]/50 py-3 text-sm font-semibold text-white hover:border-[#1CEAB9]/80 disabled:opacity-60"
            >
              {loading ? "Creating Token..." : "Mint Token / Estimated 0.05 SOL"}
            </button>
          </form>
        </div>
      </div>

      {/* Status modal (no backdrop-blur; clean) */}
      {statusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close status"
            className="absolute inset-0 bg-black/70"
            onClick={() => setStatusOpen(false)}
            disabled={loading}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-[#1CEAB9]/40 overflow-hidden">
            <div className="bg-[#0B0E11] text-white">
              <div className="px-4 py-4 border-b border-white/10 flex items-start justify-between">
                <div>
                  <div className="text-base font-semibold">Mint Console</div>
                  <div className="text-xs text-white/50 mt-1">Live progress + receipt</div>
                </div>

                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setStatusOpen(false)}
                  disabled={loading}
                  className="h-9 w-9 grid place-items-center rounded-full border border-white/10 bg-black/30 hover:border-[#1CEAB9]/40 disabled:opacity-40"
                >
                  <FaTimes />
                </button>
              </div>

              <StatusBody status={status} loading={loading} />

              <div className="px-4 py-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-white/50">
                  {loading ? "Minting in progress…" : "Ready."}
                </div>

                <button
                  type="button"
                  onClick={() => setStatusOpen(false)}
                  className="h-10 px-4 rounded-xl border border-white/10 bg-black/30 text-sm hover:border-[#1CEAB9]/40"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-white/80">{label}</div>
      {children}
    </div>
  );
}

function StatusBody({ status, loading }) {
  const s = String(status || "");

  const steps = [
    { key: "build", label: "Building transaction", match: /Building transaction/i },
    { key: "upload", label: "Uploading metadata", match: /Uploading metadata/i },
    { key: "approve", label: "Awaiting wallet approval", match: /approve|wallet/i },
    { key: "confirm", label: "Confirming on Solana", match: /Confirming transaction/i },
    { key: "save", label: "Saving to OriginFi", match: /Saving token to OriginFi/i },
    { key: "done", label: "Completed", match: /Token minted and saved|Token minted successfully/i },
  ];

  let currentIdx = 0;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].match.test(s)) currentIdx = i;
  }

  const mint = (s.match(/Mint:\s*([A-Za-z0-9]{32,})/i) || [])[1] || "";
  const ata = (s.match(/ATA:\s*([A-Za-z0-9]{32,})/i) || [])[1] || "";
  const tx = (s.match(/Tx:\s*([A-Za-z0-9]{32,})/i) || [])[1] || "";

  const isDone = /Token minted and saved|Token minted successfully/i.test(s);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const explorerTxUrl = tx ? `https://explorer.solana.com/tx/${tx}` : "";
  const explorerMintUrl = mint ? `https://explorer.solana.com/address/${mint}` : "";

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="text-sm font-semibold">Progress</div>
        <div className="mt-3 space-y-2">
          {steps.map((st, i) => {
            const completed = i < currentIdx || (isDone && i <= currentIdx);
            const active = i === currentIdx && loading;

            return (
              <div key={st.key} className="flex items-center gap-3">
                <div className="w-5 h-5 grid place-items-center">
                  {completed ? (
                    <FaCheckCircle className="text-[#1CEAB9]" />
                  ) : active ? (
                    <FaSpinner className="animate-spin text-[#1CEAB9]" />
                  ) : (
                    <FaRegCircle className="text-white/30" />
                  )}
                </div>
                <div className="text-sm text-white/80">{st.label}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-white/60 whitespace-pre-wrap">
          {status || "Waiting for your first action…"}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-3">
        <div className="text-sm font-semibold">Receipt</div>

        <KV k="Mint" v={mint || "—"} onCopy={mint ? () => copy(mint) : null} explorer={explorerMintUrl} />
        <KV k="ATA" v={ata || "—"} onCopy={ata ? () => copy(ata) : null} />
        <KV k="Tx" v={tx || "—"} onCopy={tx ? () => copy(tx) : null} explorer={explorerTxUrl} />
      </div>
    </div>
  );
}

function KV({ k, v, onCopy, explorer }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs text-white/40">{k}</div>
      <div className="flex items-center gap-2">
        <div className="max-w-[210px] break-all text-right text-xs text-white/80">{v}</div>

        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="h-8 px-2 rounded-lg border border-white/10 bg-black/30 text-xs hover:border-[#1CEAB9]/40"
            title="Copy"
          >
            <FaCopy />
          </button>
        )}

        {explorer && (
          <a
            href={explorer}
            target="_blank"
            rel="noreferrer"
            className="h-8 px-2 rounded-lg border border-white/10 bg-black/30 text-xs hover:border-[#1CEAB9]/40 flex items-center"
            title="Explorer"
          >
            <FaExternalLinkAlt />
          </a>
        )}
      </div>
    </div>
  );
}
