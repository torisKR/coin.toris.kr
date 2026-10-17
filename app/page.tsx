import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CollectionGallery } from "@/components/CollectionGallery";
import {
  Arrow,
  CollectionFooter,
  CollectionNav,
} from "@/components/CollectionChrome";
import { CollectionReveal } from "@/components/CollectionReveal";
import {
  coins,
  coinPath,
  coinUrl,
  CREATOR_ADDRESS,
  CREATOR_URL,
} from "@/utils/coins";
import { SITE_URL } from "@/utils/site";

export const metadata: Metadata = {
  title: { absolute: "Toris Coin | Three Characters, Three 3D Worlds" },
  description:
    "Meet PEPEBear, Yeti, and XMasRocket in three interactive 3D worlds. Explore verified token sources and create a square meme in Toris Coin Studio.",
  alternates: { canonical: "/" },
};

export default function CollectionHome() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Toris Coin",
        url: SITE_URL,
        inLanguage: "en",
        description:
          "An interactive creator collection for PEBR, YETI, and XMASR.",
      },
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/#collection`,
        name: "Toris Coin collection",
        url: SITE_URL,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: coins.map((coin, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${coin.name} (${coin.symbol})`,
            url: coinUrl(coin.symbol),
          })),
        },
      },
    ],
  };

  return (
    <div className="collection-site toris-world-site">
      <CollectionNav />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />

        <section className="coin-home-hero collection-width" aria-labelledby="home-title">
          <div className="coin-home-intro">
            <span className="collection-eyebrow">TORIS COIN COLLECTION</span>
            <h1 id="home-title">
              Three characters.
              <br />
              <span>Pick your world.</span>
            </h1>
            <p>Meet the collection, play with each character, then make it your own.</p>
            <div className="coin-home-actions">
              <a className="collection-button collection-button-dark" href="#world-picker">
                Choose a character <Arrow diagonal={false} />
              </a>
              <Link className="collection-text-link" href="/studio" prefetch={false}>
                Open Studio <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <div id="world-picker">
            <CollectionGallery />
          </div>
        </section>

        <section className="world-collection collection-width" id="collection" aria-labelledby="collection-title">
          <CollectionReveal>
            <h2 id="collection-title">A collection with real depth.</h2>
            <p>
              Shared materials and camera rules keep the set together. Each world still has its own action, atmosphere, and token source.
            </p>
          </CollectionReveal>
          <div className="world-collection-grid">
            {coins.map((coin, index) => (
              <CollectionReveal
                key={coin.symbol}
                className={`world-card theme-${coin.theme} ${index === 0 ? "world-card-featured" : ""}`}
              >
                <Link href={coinPath(coin.symbol)} prefetch={false}>
                  <div className="world-card-art">
                    <picture>
                      <source
                        media="(max-width: 767px)"
                        srcSet={coin.world.poster.replace(".png", "-thumb.webp")}
                      />
                      <Image
                        src={coin.world.poster.replace(".png", ".webp")}
                        alt={`${coin.name} character world`}
                        fill
                        sizes={index === 0 ? "(max-width: 767px) 92vw, 56vw" : "(max-width: 767px) 92vw, 28vw"}
                      />
                    </picture>
                  </div>
                  <div className="world-card-copy">
                    <div>
                      <h3>{coin.name}</h3>
                      <span>${coin.symbol}</span>
                    </div>
                    <p>{coin.line}</p>
                    <span className="world-card-link">Explore world <Arrow /></span>
                  </div>
                </Link>
              </CollectionReveal>
            ))}
          </div>
        </section>

        <section className="studio-banner collection-width" aria-labelledby="studio-title">
          <CollectionReveal className="studio-banner-inner">
            <div>
              <h2 id="studio-title">Your caption. Their pose.</h2>
              <p>
                Choose any coin, pose, and backdrop. Export a 1080 by 1080 PNG directly in your browser.
              </p>
            </div>
            <div className="studio-banner-poses" aria-hidden="true">
              {coins.map((coin) => (
                <Image key={coin.symbol} src={coin.poses[1].replace(".png", ".webp")} alt="" width={320} height={320} />
              ))}
            </div>
            <Link href="/studio" prefetch={false} className="collection-button collection-button-dark">
              Make a meme <Arrow />
            </Link>
          </CollectionReveal>
        </section>

        <section className="source-section collection-width" id="creator" aria-labelledby="source-title">
          <CollectionReveal className="source-section-grid">
            <div>
              <h2 id="source-title">Original art stays visible.</h2>
              <p>
                Every character world is a new interpretation. The original token artwork, mint address, and public source links remain on each detail page.
              </p>
            </div>
            <div>
              <code>{CREATOR_ADDRESS}</code>
              <a href={CREATOR_URL} target="_blank" rel="noopener noreferrer">
                View creator profile <span aria-hidden="true">↗</span>
              </a>
              <p>
                Source identity last checked October 15, 2026. Toris Coin does not display live market data or promise financial returns.
              </p>
            </div>
          </CollectionReveal>
        </section>
      </main>
      <CollectionFooter />
    </div>
  );
}
