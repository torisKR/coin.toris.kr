import type { Metadata } from "next";
import "./globals.css";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { SITE_URL } from "@/utils/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Toris Coin | The Meme Coin Collection",
    template: "%s | Toris Coin",
  },
  description:
    "Discover the Toris Coin collection: PEPEBear (PEBR), Yeti (YETI), and XMasRocket (XMASR). Explore three Solana meme coins from one creator.",
  applicationName: "Toris Coin",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Toris Coin",
    title: "Toris Coin | Three characters. Three worlds.",
    description:
      "Discover the Toris Coin collection: PEPEBear (PEBR), Yeti (YETI), and XMasRocket (XMASR). Explore three Solana meme coins from one creator.",
    url: SITE_URL,
    images: [
      {
        url: "/worlds/toris-coin-og.webp",
        width: 1200,
        height: 630,
        alt: "PEPEBear, Yeti, and XMasRocket in the Toris Coin character worlds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@toris_kr",
    title: "Toris Coin | Three characters. Three worlds.",
    description:
      "Discover the Toris Coin collection: PEPEBear (PEBR), Yeti (YETI), and XMasRocket (XMASR). Explore three Solana meme coins from one creator.",
    images: ["/worlds/toris-coin-og.webp"],
  },
  icons: { icon: "/brand-mark.svg", apple: "/brand-mark.png" },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
