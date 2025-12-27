// src/utils/mintSPLToken.js
import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

/**
 * Mint a new SPL token on Solana Devnet
 * @param {Object} options
 * @param {PublicKey} options.walletPublicKey - Phantom wallet public key
 * @param {Function} options.sendTransaction - Phantom's sendTransaction method
 * @param {number} options.decimals - Number of decimals (usually 6 or 9)
 * @param {number} options.supply - Total token supply (raw, no decimals)
 * @returns {string} - New mint address
 */
export async function mintSPLToken({
  walletPublicKey,
  sendTransaction,
  decimals = 6,
  supply = 1000000,
}) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Create the new token mint
  const mint = await createMint(
    connection,
    walletPublicKey, // payer
    walletPublicKey, // mint authority
    walletPublicKey, // freeze authority
    decimals
  );

  // Get or create associated token account for the user
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    walletPublicKey,
    mint,
    walletPublicKey
  );

  // Mint tokens to user's associated token account
  const tx = new Transaction().add(
    mintTo(
      connection,
      walletPublicKey,
      mint,
      tokenAccount.address,
      walletPublicKey,
      supply
    )
  );

  const signature = await sendTransaction(tx, connection);
  await connection.confirmTransaction(signature, "confirmed");

  return mint.toBase58();
}
