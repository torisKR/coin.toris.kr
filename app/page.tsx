"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { PhaseCard } from "@/components/PhaseCard";
import { UserStats } from "@/components/UserStats";
import { AchievementBadge } from "@/components/AchievementBadge";
import { TokenHolders } from "@/components/TokenHolders";
import { TrendingUp, Rocket, Users, Zap } from "lucide-react";
import { getTokenStats } from "@/utils/tokenStats";

export default function Home() {
  const { connected } = useWallet();
  const { connection } = useConnection();
  const [phaseStats, setPhaseStats] = useState({
    totalParticipants: 0,
    totalVolume: 0,
    rewardsPool: 0,
  });

  // Fetch real token statistics
  useEffect(() => {
    async function fetchStats() {
      const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS;
      if (!tokenAddress) return;

      try {
        const stats = await getTokenStats(connection, tokenAddress);
        setPhaseStats({
          totalParticipants: stats.totalHolders,
          totalVolume: Math.round(stats.totalVolume),
          rewardsPool: Math.round(stats.totalVolume * 0.1), // 10% of volume as rewards
        });
      } catch (error) {
        console.error("Failed to fetch token stats:", error);
      }
    }

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [connection]);

  // Phase data with real statistics
  const phases = [
    {
      phaseNumber: 1,
      name: "Launch Phase",
      description: "The beginning of the PEPEBear revolution",
      isActive: true,
      totalParticipants: phaseStats.totalParticipants,
      totalVolume: phaseStats.totalVolume,
      rewardsPool: phaseStats.rewardsPool,
    },
    {
      phaseNumber: 2,
      name: "Growth Phase",
      description: "Expanding the PEPEBear community",
      isActive: false,
      totalParticipants: 0,
      totalVolume: 0,
      rewardsPool: 0,
    },
    {
      phaseNumber: 3,
      name: "Moon Phase",
      description: "To the moon and beyond!",
      isActive: false,
      totalParticipants: 0,
      totalVolume: 0,
      rewardsPool: 0,
    },
  ];

  const achievements = [
    {
      id: 1,
      name: "First Steps",
      description: "Join your first phase",
      unlocked: connected,
      icon: <Rocket className="w-6 h-6 text-yellow-300" />,
    },
    {
      id: 2,
      name: "Community Builder",
      description: "Refer 10 friends",
      unlocked: false,
      icon: <Users className="w-6 h-6 text-yellow-300" />,
    },
    {
      id: 3,
      name: "Power User",
      description: "Reach level 10",
      unlocked: false,
      icon: <Zap className="w-6 h-6 text-yellow-300" />,
    },
    {
      id: 4,
      name: "Whale",
      description: "Accumulate 1M points",
      unlocked: false,
      icon: <TrendingUp className="w-6 h-6 text-yellow-300" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 sm:mb-8 flex justify-center px-4"
          >
            <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto rounded-2xl overflow-hidden shadow-2xl ring-2 ring-purple-500/50">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
                poster="/pepeBear.png"
              >
                <source src="/PEBRVideo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{
              scale: 1.15,
              rotate: [0, -8, 8, -8, 0],
              y: [0, -10, 0],
              transition: {
                duration: 0.6,
                type: "spring",
                stiffness: 300,
                damping: 10,
              },
            }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-4 sm:mb-6 px-4 cursor-pointer inline-block select-none pepebear-title"
            style={{
              background:
                "linear-gradient(135deg, #a855f7 0%, #ec4899 25%, #fbbf24 50%, #10b981 75%, #3b82f6 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))",
            }}
          >
            PEPEBear
          </motion.h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            The meme crypto you didn&apos;t know you needed! Cute, funny, and
            community-driven.
            <br className="hidden sm:block" />
            <span className="block sm:inline">
              <span className="text-yellow-400 font-semibold">
                HODL, laugh, and join the PEPEBear revolution!
              </span>
            </span>
          </p>
          {!connected && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 px-4"
            >
              Connect your wallet to start earning points and unlocking
              achievements!
            </motion.p>
          )}
        </motion.section>

        {/* User Stats */}
        {connected && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <UserStats
              level={1}
              totalPoints={0}
              achievements={0}
              phaseParticipation={0}
            />
          </motion.section>
        )}

        {/* Phases Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center px-4">
            Project Phases
          </h2>
          <div className="relative px-4">
            {/* Timeline vertical line - only visible on md and above */}
            <div
              className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 via-pink-500 to-yellow-500 hidden md:block"
              style={{ top: 0, bottom: 0 }}
            />

            <div className="space-y-6 sm:space-y-8 md:space-y-12 relative">
              {phases.map((phase, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <motion.div
                    key={phase.phaseNumber}
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.15 }}
                    className={`relative w-full flex items-center ${
                      isLeft ? "justify-start" : "justify-end"
                    }`}
                  >
                    {/* Timeline dot - only visible on md and above */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-black shadow-lg z-10 hidden md:flex items-center justify-center">
                      {phase.isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-yellow-400"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white z-10" />
                    </div>

                    {/* Horizontal connecting line to timeline - only visible on md and above */}
                    <div
                      className={`absolute left-1/2 transform -translate-x-1/2 h-0.5 md:h-1 bg-gradient-to-r ${
                        isLeft
                          ? "from-purple-500/50 to-transparent right-1/2"
                          : "from-transparent to-pink-500/50 left-1/2"
                      } hidden md:block`}
                      style={{
                        width: isLeft ? "calc(50% - 2rem)" : "calc(50% - 2rem)",
                        [isLeft ? "right" : "left"]: "50%",
                      }}
                    />

                    <div
                      className={`w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl relative z-0 ${
                        isLeft ? "md:pr-8" : "md:pl-8"
                      }`}
                    >
                      <PhaseCard {...phase} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Achievements Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center px-4">
            Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto px-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              >
                <AchievementBadge {...achievement} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Token Holders Section */}
        {process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-8 sm:mb-12 lg:mb-16 px-4"
          >
            <TokenHolders
              mintAddress={process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS}
              limit={20}
            />
          </motion.section>
        )}

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 sm:mt-12 lg:mt-16 text-center px-4"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Ready to join the revolution?
            </h2>
            <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6">
              Connect your wallet and start earning points, unlocking
              achievements, and participating in phases!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <a
                href="https://pump.fun/coin/7Ndrtiq37uU48cua8VVry31ygZPTAJSWwtCDhHBnpump"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                Trade on Pump.fun
              </a>
              <a
                href="https://x.com/PEBR_Coin"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-colors text-sm sm:text-base"
              >
                Follow on X
              </a>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 lg:mt-16 py-6 sm:py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm sm:text-base">
            © 2025 PEPEBear. Built with ❤️ on Solana
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
            <a
              href="https://github.com/toris-dev/PEPEBear"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors text-sm sm:text-base"
            >
              GitHub
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://x.com/PEBR_Coin"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors text-sm sm:text-base"
            >
              Twitter
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://pump.fun/coin/7Ndrtiq37uU48cua8VVry31ygZPTAJSWwtCDhHBnpump"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors text-sm sm:text-base"
            >
              Pump.fun
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
