# PEPEBear Frontend

Modern, interactive frontend for PEPEBear built with Next.js, React, and Web3.

## About PEPEBear

**PEPEBear** is a community-driven meme cryptocurrency built on the Solana blockchain. Combining the playful spirit of meme culture with innovative Web3 features, PEPEBear offers an engaging experience through gamification, phase-based development, and real-time token holder tracking.

### Key Highlights

- 🐻 **Community-Driven**: Join a vibrant community of holders and supporters
- 🎮 **Gamified Experience**: Earn points, unlock achievements, and level up through participation
- 📊 **Real-Time Analytics**: Track token holders, volume, and participation metrics live
- 🚀 **Phase-Based Growth**: Structured development phases (Launch → Growth → Moon)
- 💎 **Transparent & On-Chain**: Built on Solana with Anchor framework for transparency
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations and timeline visualization

## Features

- 🎨 Beautiful, interactive UI with animations and timeline-based phase display
- 🔌 Solana wallet integration (Phantom, Solflare, and more)
- 🎮 Gamification elements (points, levels, achievements)
- 📊 Real-time token holder tracking with rank changes and animations
- 📈 Live token statistics (participants, volume, rewards)
- 📱 Fully responsive design for all devices
- ⚡ Fast and optimized performance
- 🎯 SEO optimized with Open Graph metadata

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Solana Wallet Adapter** - Web3 integration
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout with providers and metadata
│   ├── page.tsx            # Home page with phases and token holders
│   ├── providers.tsx       # Web3 providers (Solana wallet adapter)
│   └── globals.css         # Global styles and animations
├── components/             # React components
│   ├── Header.tsx          # Navigation header with logo
│   ├── WalletButton.tsx    # Wallet connection button
│   ├── PhaseCard.tsx       # Phase information card
│   ├── UserStats.tsx       # User statistics display
│   ├── AchievementBadge.tsx # Achievement badge component
│   └── TokenHolders.tsx    # Token holder list with pagination
├── utils/                  # Utility functions
│   ├── tokenHolders.ts     # Token holder fetching logic
│   └── tokenStats.ts       # Token statistics calculation
├── public/                 # Static assets
│   ├── logo.png           # PEPEBear logo
│   ├── pepeBear.png       # PEPEBear mascot image
│   ├── PEBRVideo.mp4      # Promotional video
│   └── manifest.json      # PWA manifest
└── package.json
```

## Environment Variables

Create a `.env.local` file for development:

```env
# Solana Network (devnet or mainnet-beta)
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Solana RPC URL
# For production, use a reliable RPC provider like Helius or QuickNode
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# PEPEBear Token Mint Address (Required)
# The SPL token mint address for PEPEBear
# Example: Token mint address from pump.fun or other DEX
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=YOUR_TOKEN_MINT_ADDRESS_HERE
```

**Important**: 
- `NEXT_PUBLIC_TOKEN_MINT_ADDRESS` must be set for the token holder list to display on the homepage
- For production, use a reliable RPC provider (Helius, QuickNode, etc.) as the public Solana RPC has rate limits and may restrict certain methods like `getTokenLargestAccounts`

## 🚀 Deployment

### Deploy to Vercel

1. **Connect Your Project**

   - Log in to [Vercel](https://vercel.com)
   - Connect your GitHub repository or upload directly
   - **Set Root Directory to `frontend`**

2. **Configure Environment Variables**

   In Vercel dashboard, add these environment variables:

   ```
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_RPC_URL=https://your-rpc-provider-url.com
   NEXT_PUBLIC_TOKEN_MINT_ADDRESS=YOUR_TOKEN_MINT_ADDRESS
   ```

   **Production Recommendations**:
   - Use `mainnet-beta` for `NEXT_PUBLIC_SOLANA_NETWORK`
   - Use a reliable RPC provider URL (Helius, QuickNode, etc.) for `NEXT_PUBLIC_RPC_URL`
   - Ensure your RPC provider supports `getTokenLargestAccounts` method

3. **Automatic Deployment**
   - Push to GitHub to trigger automatic deployment
   - Or use `vercel` CLI: `vercel --prod`

### Production Checklist

- [ ] Set `NEXT_PUBLIC_SOLANA_NETWORK` to `mainnet-beta`
- [ ] Configure a reliable RPC provider URL
- [ ] Set the correct token mint address
- [ ] Verify token holder list displays correctly
- [ ] Test wallet connection on production
- [ ] Check responsive design on mobile devices

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Anchor Framework](https://www.anchor-lang.com/)
