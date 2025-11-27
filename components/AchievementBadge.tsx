"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle2 } from "lucide-react";

interface AchievementBadgeProps {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  icon?: React.ReactNode;
}

export function AchievementBadge({
  name,
  description,
  unlocked,
  icon,
}: AchievementBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className={`relative rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 transition-all ${
        unlocked
          ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-lg"
          : "bg-gray-800 border-gray-700 opacity-50"
      }`}
    >
      {unlocked && (
        <motion.div
          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
        </motion.div>
      )}
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
            unlocked ? "bg-white/20" : "bg-gray-700"
          }`}
        >
          {icon || (
            <Award
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                unlocked ? "text-yellow-300" : "text-gray-500"
              }`}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm sm:text-base font-bold ${
              unlocked ? "text-white" : "text-gray-400"
            }`}
          >
            {name}
          </h3>
          <p
            className={`text-xs sm:text-sm ${
              unlocked ? "text-white/80" : "text-gray-500"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
