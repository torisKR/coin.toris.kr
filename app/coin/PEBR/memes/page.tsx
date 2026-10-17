import type { Metadata } from "next";
import Link from "next/link";
import { CollectionFooter, CollectionNav } from "@/components/CollectionChrome";
import { MemeStudio } from "@/components/MemeStudio";

export const metadata: Metadata = {
  title: { absolute: "PEPEBear Meme Maker | Toris Coin Studio" },
  description:
    "Create a PEPEBear meme in the Toris Coin Studio and export a free 1080 by 1080 PNG in your browser.",
  alternates: { canonical: "/studio?coin=PEBR" },
};

export default function LegacyPEBRStudioPage() {
  return (
    <div className="collection-site toris-world-site studio-page">
      <CollectionNav />
      <main id="main" className="collection-width">
        <div className="studio-page-intro">
          <Link href="/coin/PEBR">← PEPEBear world</Link>
          <h1>PEPEBear in Toris Coin Studio</h1>
          <p>This saved route now opens the shared editor with PEBR selected.</p>
        </div>
        <MemeStudio initialCoin="PEBR" />
      </main>
      <CollectionFooter />
    </div>
  );
}
