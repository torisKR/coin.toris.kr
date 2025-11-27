"use client";

import { motion } from "framer-motion";
import { Twitter, Github, ExternalLink } from "lucide-react";
import { WalletButton } from "./WalletButton";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/50 border-b border-white/10">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-3 min-w-0"
          >
            <div className="flex-shrink-0">
              <Image
                src="/logo.png"
                width={48}
                height={48}
                alt="PEPEBear Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
                PEPEBear
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                The meme crypto revolution
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 md:gap-4">
              <a
                href="https://x.com/PEBR_Coin"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://pump.fun/coin/7Ndrtiq37uU48cua8VVry31ygZPTAJSWwtCDhHBnpump"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ExternalLink className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://github.com/toris-dev/PEPEBear"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Github className="w-5 h-5 text-white" />
              </a>
            </div>
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
