// src/utils/solana.js
import { Connection, clusterApiUrl } from "@solana/web3.js";

/**
 * Single source of truth for Solana connections used by
 * authority actions, analytics, and token reads.
 *
 * Minting uses its own explicit Connection and is NOT affected.
 */
export function getConnection() {
  const rpc = import.meta.env.VITE_SOLANA_RPC;

  // Prefer your private RPC (Helius / QuickNode / etc)
  if (rpc && typeof rpc === "string" && rpc.startsWith("http")) {
    return new Connection(rpc, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60_000,
    });
  }

  // Safe fallback (should not normally be used in prod)
  return new Connection(clusterApiUrl("mainnet-beta"), {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60_000,
  });
}
