import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoinDetailPage } from "@/components/CoinDetailPage";
import { coins, findCoin, coinPath } from "@/utils/coins";

type Props = { params: Promise<{ symbol: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return coins
    .filter((coin) => coin.symbol !== "PEBR")
    .map((coin) => ({ symbol: coin.symbol }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const coin = findCoin((await params).symbol);
  if (!coin) return {};
  const title = `${coin.name} (${coin.symbol}) 3D World | Toris Coin`;
  return {
    title: { absolute: title },
    description: coin.description,
    alternates: { canonical: coinPath(coin.symbol) },
    openGraph: {
      title,
      description: coin.description,
      url: coinPath(coin.symbol),
      siteName: "Toris Coin",
      type: "website",
      images: [
        {
          url: coin.world.poster,
          width: 1200,
          height: 1200,
          alt: `${coin.name} 3D world`,
        },
      ],
    },
    twitter: {
      title,
      description: coin.description,
      card: "summary_large_image",
      images: [coin.world.poster],
    },
  };
}

export default async function CoinPage({ params }: Props) {
  const coin = findCoin((await params).symbol);
  if (!coin || coin.symbol === "PEBR") notFound();
  return <CoinDetailPage coin={coin} />;
}
