"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Zap, Award } from "lucide-react";

interface UserStatsProps {
  level: number;
  totalPoints: number;
  achievements: number;
  phaseParticipation: number;
}

export function UserStats({
  level,
  totalPoints,
  achievements,
  phaseParticipation,
}: UserStatsProps) {
  const progressToNextLevel =
    ((totalPoints % (level * 1000)) / (level * 1000)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 sm:p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Your Stats</h2>
        <motion.div
          className="relative"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
        </motion.div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm sm:text-base text-white/80">
              Level {level}
            </span>
            <span className="text-sm sm:text-base text-white font-semibold">
              {totalPoints.toLocaleString()} pts
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 sm:h-3 overflow-hidden">
            <motion.div
              className="bg-yellow-300 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextLevel}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-white">{level}</p>
            <p className="text-xs text-white/80">Level</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-white">
              {achievements}
            </p>
            <p className="text-xs text-white/80">Achievements</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-white">
              {phaseParticipation}
            </p>
            <p className="text-xs text-white/80">Phases</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
