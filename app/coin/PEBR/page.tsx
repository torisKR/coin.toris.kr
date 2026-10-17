import type { Metadata } from "next";
import { CoinDetailPage } from "@/components/CoinDetailPage";
import { findCoin } from "@/utils/coins";

const coin = findCoin("PEBR")!;

export const metadata: Metadata = {
  title: { absolute: "PEPEBear (PEBR) 3D World | Toris Coin" },
  description: coin.description,
  alternates: { canonical: "/coin/PEBR" },
  openGraph: {
    title: "PEPEBear (PEBR) 3D World",
    description: coin.description,
    url: "/coin/PEBR",
    siteName: "Toris Coin",
    type: "website",
    images: [
      {
        url: coin.world.poster,
        width: 1200,
        height: 1200,
        alt: "PEPEBear coffee garden world",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PEPEBear (PEBR) 3D World",
    description: coin.description,
    images: [coin.world.poster],
  },
};

export default function PEBRPage() {
  return <CoinDetailPage coin={coin} />;
}
