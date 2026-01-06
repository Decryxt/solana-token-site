// src/utils/solana.js
import { Connection, clusterApiUrl } from "@solana/web3.js";

/**
 * Single source of truth for the Solana connection used by the frontend.
 * Keep devnet for now; later we’ll flip to env-based mainnet-beta safely.
 */
export function getConnection() {
  return new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
}
