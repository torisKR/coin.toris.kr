"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Gift } from "lucide-react";

interface PhaseCardProps {
  phaseNumber: number;
  name: string;
  description: string;
  isActive: boolean;
  totalParticipants: number;
  totalVolume: number;
  rewardsPool: number;
}

// Format large numbers for display
function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toLocaleString();
}

export function PhaseCard({
  phaseNumber,
  name,
  description,
  isActive,
  totalParticipants,
  totalVolume,
  rewardsPool,
}: PhaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl ${
        isActive
          ? "bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500"
          : "bg-gradient-to-br from-gray-700 to-gray-900"
      }`}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "linear",
          }}
        />
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
            Phase {phaseNumber}
          </span>
          {isActive && (
            <motion.span
              className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white flex-shrink-0"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ACTIVE
            </motion.span>
          )}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{name}</h3>
        <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6">{description}</p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 min-w-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white mb-1 shrink-0" />
            <p className="text-xs text-white/80 truncate">Participants</p>
            <p 
              className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white truncate"
              title={totalParticipants.toLocaleString()}
            >
              {formatNumber(totalParticipants)}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 min-w-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white mb-1 shrink-0" />
            <p className="text-xs text-white/80 truncate">Volume</p>
            <p 
              className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white truncate"
              title={totalVolume.toLocaleString()}
            >
              {formatNumber(totalVolume)}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 min-w-0">
            <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white mb-1 shrink-0" />
            <p className="text-xs text-white/80 truncate">Rewards</p>
            <p 
              className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white truncate"
              title={rewardsPool.toLocaleString()}
            >
              {formatNumber(rewardsPool)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
