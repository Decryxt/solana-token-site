// src/utils/getBalance.js
import { PublicKey } from "@solana/web3.js";

export const getSolBalance = async (connection, publicKey) => {
  try {
    const lamports = await connection.getBalance(new PublicKey(publicKey));
    return lamports / 1e9; // convert lamports to SOL
  } catch (err) {
    console.error("Failed to fetch balance:", err);
    return 0;
  }
};
