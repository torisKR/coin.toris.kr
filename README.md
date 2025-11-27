# PEPEBear Frontend

Modern, interactive frontend for PEPEBear built with Next.js, React, and Web3.

## Features

- 🎨 Beautiful, interactive UI with animations
- 🔌 Solana wallet integration (Phantom, Solflare)
- 🎮 Gamification elements (points, levels, achievements)
- 📱 Responsive design
- ⚡ Fast and optimized

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
├── app/              # Next.js app directory
│   ├── layout.tsx    # Root layout with providers
│   ├── page.tsx      # Home page
│   └── providers.tsx # Web3 providers
├── components/       # React components
│   ├── Header.tsx
│   ├── WalletButton.tsx
│   ├── PhaseCard.tsx
│   ├── UserStats.tsx
│   └── AchievementBadge.tsx
└── package.json
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# PEPEBear Token Mint Address (필수)
# 실제 토큰 mint 주소를 입력하세요
# 예: pump.fun에서 발행된 토큰의 mint 주소
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=YOUR_TOKEN_MINT_ADDRESS_HERE
```

**중요**: `NEXT_PUBLIC_TOKEN_MINT_ADDRESS`를 설정해야 홈페이지에서 토큰 홀더 목록이 표시됩니다.

## 🚀 Deployment

### Vercel 배포

1. **프로젝트 연결**

   - [Vercel](https://vercel.com)에 로그인
   - GitHub 저장소 연결 또는 직접 업로드
   - **Root Directory를 `frontend`로 설정**

2. **환경 변수 설정**

   ```
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_TOKEN_MINT_ADDRESS=YOUR_TOKEN_MINT_ADDRESS
   ```

3. **자동 배포**
   - GitHub에 푸시하면 자동 배포
   - 또는 `vercel` CLI 사용

자세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md) 참고

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Anchor Framework](https://www.anchor-lang.com/)
