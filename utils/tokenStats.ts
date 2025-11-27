import { Connection, PublicKey } from "@solana/web3.js";
import { getTokenHolders } from "./tokenHolders";

export interface TokenStats {
  totalHolders: number;
  totalSupply: number;
  totalVolume: number; // Estimated from holders
}

/**
 * Get token statistics including holder count and supply
 */
export async function getTokenStats(
  connection: Connection,
  mintAddress: string
): Promise<TokenStats> {
  try {
    const mintPublicKey = new PublicKey(mintAddress);

    // Get token supply
    let totalSupply = 0;
    try {
      const supply = await connection.getTokenSupply(mintPublicKey);
      totalSupply = supply.value.uiAmount || 0;
    } catch (err) {
      console.warn("Failed to get token supply:", err);
    }

    // Get all holders (up to 20 largest)
    const holders = await getTokenHolders(connection, mintAddress, 20);
    const totalHolders = holders.length;

    // Calculate estimated volume from top holders
    const totalVolume = holders.reduce(
      (sum, holder) => sum + holder.uiAmount,
      0
    );

    return {
      totalHolders,
      totalSupply: totalSupply,
      totalVolume: totalVolume,
    };
  } catch (error) {
    console.error("Error fetching token stats:", error);
    return {
      totalHolders: 0,
      totalSupply: 0,
      totalVolume: 0,
    };
  }
}
