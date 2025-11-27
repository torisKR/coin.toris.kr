"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";

export function WalletButton() {
  useWallet(); // For future use

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-full !px-3 !sm:px-6 !py-2 !sm:py-3 !font-semibold !text-white !shadow-lg !transition-all !text-xs !sm:text-sm" />
    </motion.div>
  );
}
