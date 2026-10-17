import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoinWorld } from "@/components/CoinWorld";
import { coins, findCoin } from "@/utils/coins";

type Props = { params: Promise<{ symbol: string }> };

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Interactive character world",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return coins.map((coin) => ({ symbol: coin.symbol }));
}

export default async function WorldEmbed({ params }: Props) {
  const coin = findCoin((await params).symbol);
  if (!coin) notFound();
  return (
    <main id="main" className="world-embed toris-world-site">
      <CoinWorld symbol={coin.symbol} compact />
    </main>
  );
}
