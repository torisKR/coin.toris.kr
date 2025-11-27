"use client";

import { useEffect, useState, useRef } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Wallet,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getTokenHolders, TokenHolder } from "@/utils/tokenHolders";

interface TokenHoldersProps {
  mintAddress: string;
  limit?: number;
}

const ITEMS_PER_PAGE = 10;
const REFRESH_INTERVAL = 30000; // 30 seconds

export function TokenHolders({ mintAddress, limit = 20 }: TokenHoldersProps) {
  const { connection } = useConnection();
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [previousHolders, setPreviousHolders] = useState<TokenHolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const holderRefs = useRef<Map<string, number>>(new Map());

  // Track previous rankings for animation
  useEffect(() => {
    if (holders.length > 0) {
      holders.forEach((holder, index) => {
        holderRefs.current.set(holder.address, index);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holders.length]);

  useEffect(() => {
    async function fetchHolders() {
      if (!mintAddress) {
        setError("Token address is not configured.");
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const data = await getTokenHolders(connection, mintAddress, limit);

        // Update previous holders before setting new ones for animation
        setHolders((prevHolders) => {
          if (prevHolders.length > 0) {
            setPreviousHolders(prevHolders);
          }
          return data;
        });

        if (data.length === 0) {
          setError("No token holders found.");
        }
      } catch (err) {
        console.error("Failed to fetch token holders:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load token holder information.";

        if (
          errorMessage.includes("403") ||
          errorMessage.includes("forbidden")
        ) {
          setError(
            `RPC access denied.\n\n` +
              `Free RPC may have limitations.\n` +
              `Please use a more stable RPC:\n` +
              `- Helius (free tier available)\n` +
              `- QuickNode\n` +
              `- Alchemy\n\n` +
              `Update NEXT_PUBLIC_RPC_URL environment variable.`
          );
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchHolders();

    // Set up polling for real-time updates
    const interval = setInterval(fetchHolders, REFRESH_INTERVAL);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, mintAddress, limit]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatBalance = (amount: number) => {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(2)}K`;
    }
    return amount.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(holders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentHolders = holders.slice(startIndex, endIndex);

  // Get previous rank for animation
  const getPreviousRank = (address: string): number | null => {
    const prevIndex = previousHolders.findIndex((h) => h.address === address);
    return prevIndex !== -1 ? prevIndex + 1 : null;
  };

  if (loading && holders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 sm:p-6 shadow-xl"
      >
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
          <p className="text-white text-lg">Loading token holders...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-4 sm:p-8 shadow-xl"
      >
        <div className="text-center">
          <p className="text-white font-semibold mb-4 text-lg">Error</p>
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <p className="text-white/90 text-sm whitespace-pre-line text-left">
              {error}
            </p>
          </div>
          <div className="text-left bg-white/5 rounded-lg p-3 mt-4">
            <p className="text-white/80 text-xs font-semibold mb-2">
              Current Settings:
            </p>
            <p className="text-white/70 text-xs">
              RPC: {process.env.NEXT_PUBLIC_RPC_URL || "Using default"}
            </p>
            <p className="text-white/70 text-xs">
              Network: {process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"}
            </p>
          </div>
          <p className="text-white/70 text-xs mt-4">
            Check browser console (F12) for detailed error logs.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 sm:p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
            Token Holders
          </h2>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shrink-0">
          <span className="text-white font-semibold text-sm sm:text-base">
            {holders.length}
          </span>
        </div>
      </div>

      {holders.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-white/50 mx-auto mb-3 sm:mb-4" />
          <p className="text-white/80 text-sm sm:text-base">
            No token holders found yet.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2 sm:space-y-3 min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {currentHolders.map((holder, displayIndex) => {
                const globalIndex = startIndex + displayIndex;
                const previousRank = getPreviousRank(holder.address);
                const currentRank = globalIndex + 1;
                const rankChanged =
                  previousRank !== null && previousRank !== currentRank;
                const rankDirection =
                  previousRank !== null && previousRank > currentRank
                    ? "up"
                    : "down";

                return (
                  <motion.div
                    key={holder.address}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      layout: { duration: 0.3 },
                      opacity: { duration: 0.2 },
                    }}
                    className={`bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 hover:bg-white/20 transition-colors ${
                      rankChanged ? "ring-2 ring-yellow-300" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <motion.div
                          key={currentRank}
                          initial={{
                            scale: 1.2,
                            rotate: rankChanged
                              ? rankDirection === "up"
                                ? -10
                                : 10
                              : 0,
                          }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-yellow-300 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-purple-900 font-bold text-xs sm:text-sm shrink-0"
                        >
                          {currentRank}
                        </motion.div>
                        {rankChanged && previousRank && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              x: rankDirection === "up" ? -10 : 10,
                            }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className={`text-xs font-semibold ${
                              rankDirection === "up"
                                ? "text-green-300"
                                : "text-red-300"
                            }`}
                          >
                            {rankDirection === "up" ? "↑" : "↓"}{" "}
                            {Math.abs(previousRank - currentRank)}
                          </motion.div>
                        )}
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <a
                            href={`https://solscan.io/account/${holder.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-mono hover:text-yellow-300 transition-colors block text-xs sm:text-sm"
                            title={holder.address}
                          >
                            <span className="hidden lg:inline break-all">
                              {holder.address}
                            </span>
                            <span className="hidden md:inline lg:hidden">
                              {`${holder.address.slice(
                                0,
                                8
                              )}...${holder.address.slice(-8)}`}
                            </span>
                            <span className="inline md:hidden">
                              {formatAddress(holder.address)}
                            </span>
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                        <span className="text-white font-semibold whitespace-nowrap text-xs sm:text-sm">
                          {formatBalance(holder.uiAmount)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          currentPage === page
                            ? "bg-yellow-300 text-purple-900"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-white/60 text-xs sm:text-sm text-center mt-3">
                Showing {startIndex + 1}-{Math.min(endIndex, holders.length)} of{" "}
                {holders.length} holders
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
