import type { Metadata } from "next";
import Link from "next/link";
import { CollectionFooter, CollectionNav } from "@/components/CollectionChrome";
import { MemeStudio } from "@/components/MemeStudio";

export const metadata: Metadata = {
  title: { absolute: "Toris Coin Studio | Create a PEBR, YETI or XMASR Meme" },
  description:
    "Choose a Toris Coin character, pose, background, and caption. Export a free 1080 by 1080 PNG in your browser.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return (
    <div className="collection-site toris-world-site studio-page">
      <CollectionNav />
      <main id="main" className="collection-width">
        <div className="studio-page-intro">
          <Link href="/">← Collection</Link>
          <h1>Toris Coin Studio</h1>
          <p>Coin, pose, background, caption, PNG. Your image stays in your browser.</p>
        </div>
        <MemeStudio />
        <section className="studio-privacy-note" aria-labelledby="studio-privacy-title">
          <h2 id="studio-privacy-title">Make it yours.</h2>
          <p>
            The editor produces a 1080 by 1080 PNG without uploading your caption or image. Download first, then attach the file to your X draft yourself.
          </p>
        </section>
      </main>
      <CollectionFooter />
    </div>
  );
}
