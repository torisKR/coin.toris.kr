import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PEPEBear - The meme crypto you didn't know you needed!",
  description:
    "Cute, funny, and community-driven. HODL, laugh, and join the PEPEBear revolution! Built on Solana blockchain.",
  keywords: [
    "PEPEBear",
    "meme coin",
    "Solana",
    "crypto",
    "blockchain",
    "PEPE",
    "bear",
    "token",
    "DeFi",
  ],
  authors: [{ name: "PEPEBear Team" }],
  creator: "PEPEBear",
  publisher: "PEPEBear",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://pepebear.vercel.app"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://pepebear.vercel.app",
    title: "PEPEBear - The meme crypto you didn't know you needed!",
    description:
      "Cute, funny, and community-driven. HODL, laugh, and join the PEPEBear revolution! Built on Solana blockchain.",
    siteName: "PEPEBear",
    images: [
      {
        url: "/pepeBear.png",
        width: 1200,
        height: 630,
        alt: "PEPEBear Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PEPEBear - The meme crypto you didn't know you needed!",
    description:
      "Cute, funny, and community-driven. HODL, laugh, and join the PEPEBear revolution!",
    images: ["/pepeBear.png"],
    creator: "@PEBR_Coin",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
