import Image from "next/image";
import Link from "next/link";
import { CoinWorld } from "./CoinWorld";
import { CopyMint } from "./CopyMint";
import {
  Arrow,
  CollectionFooter,
  CollectionNav,
} from "./CollectionChrome";
import { CollectionReveal } from "./CollectionReveal";
import {
  coins,
  coinPath,
  coinUrl,
  CREATOR_URL,
  explorerUrl,
  pumpUrl,
  type Coin,
} from "@/utils/coins";
import { SITE_URL } from "@/utils/site";

export function CoinDetailPage({ coin }: { coin: Coin }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${coinUrl(coin.symbol)}#page`,
        name: `${coin.name} (${coin.symbol}) 3D world`,
        url: coinUrl(coin.symbol),
        description: coin.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: {
          "@type": "Thing",
          name: coin.name,
          alternateName: coin.symbol,
          identifier: coin.mint,
          sameAs: [pumpUrl(coin), explorerUrl(coin)],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Collection", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: coin.name, item: coinUrl(coin.symbol) },
        ],
      },
    ],
  };
  return (
    <div className={`collection-site toris-world-site coin-world-page theme-${coin.theme}`}>
      <CollectionNav />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
        <div className="collection-width world-breadcrumb">
          <Link href="/#collection">← Collection</Link>
          <span>${coin.symbol} / SOLANA</span>
        </div>

        <section className="world-detail-hero collection-width" aria-labelledby="coin-title">
          <div className="world-detail-copy">
            <span className="collection-eyebrow">{coin.name.toUpperCase()} WORLD</span>
            <h1 id="coin-title">
              {coin.name}
              <span>${coin.symbol}</span>
            </h1>
            <p className="world-detail-line">{coin.line}</p>
            <p>{coin.description}</p>
            <div className="world-detail-actions">
              <Link href={`/studio?coin=${coin.symbol}`} className="collection-button collection-button-dark">
                Create with {coin.symbol} <Arrow />
              </Link>
              <a href={pumpUrl(coin)} target="_blank" rel="noopener noreferrer" className="collection-text-link">
                Pump.fun source <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <CoinWorld symbol={coin.symbol} />
        </section>

        <section className="world-story collection-width" aria-labelledby="world-story-title">
          <CollectionReveal className="world-story-grid">
            <div className="world-story-poster">
              <Image
                src={coin.world.poster.replace(".png", ".webp")}
                alt={`${coin.name} rendered character world`}
                fill
                sizes="(max-width: 767px) 92vw, 48vw"
              />
            </div>
            <div>
              <h2 id="world-story-title">Made for one clear action.</h2>
              <p>{coin.world.actionDescription}</p>
              <p>
                The downloadable GLB and the page poster come from the same editable Blender scene. Motion is reduced automatically when your device asks for less movement.
              </p>
              <a className="collection-text-link" href={coin.world.glb} download>
                Download web GLB <span aria-hidden="true">↓</span>
              </a>
            </div>
          </CollectionReveal>
        </section>

        <section className="identity-section collection-width" aria-labelledby="identity-title">
          <CollectionReveal className="identity-grid">
            <div>
              <h2 id="identity-title">New world. Original source.</h2>
              <p>
                The 3D world is a new Toris Coin interpretation. Use the original artwork and full mint address to check the token identity.
              </p>
              <div className="original-art">
                <Image src={coin.image} alt={coin.imageAlt} width={640} height={640} />
              </div>
            </div>
            <div className="identity-panel">
              <CopyMint mint={coin.mint} symbol={coin.symbol} />
              <dl>
                <div><dt>Name</dt><dd>{coin.name}</dd></div>
                <div><dt>Symbol</dt><dd>{coin.symbol}</dd></div>
                <div><dt>Network</dt><dd>Solana</dd></div>
              </dl>
              <nav aria-label={`${coin.symbol} public sources`}>
                <a href={pumpUrl(coin)} target="_blank" rel="noopener noreferrer">Pump.fun listing <span aria-hidden="true">↗</span></a>
                <a href={explorerUrl(coin)} target="_blank" rel="noopener noreferrer">Solscan record <span aria-hidden="true">↗</span></a>
                <a href={CREATOR_URL} target="_blank" rel="noopener noreferrer">Creator profile <span aria-hidden="true">↗</span></a>
                {coin.social && <a href={coin.social} target="_blank" rel="noopener noreferrer">Linked X profile <span aria-hidden="true">↗</span></a>}
              </nav>
              <p className="identity-note">
                Identity last checked October 15, 2026. Meme tokens are speculative and can lose all value. No live market data is shown here.
              </p>
            </div>
          </CollectionReveal>
        </section>

        <section className="other-worlds collection-width" aria-labelledby="other-worlds-title">
          <h2 id="other-worlds-title">Keep exploring.</h2>
          <div>
            {coins.filter((item) => item.symbol !== coin.symbol).map((item) => (
              <Link key={item.symbol} href={coinPath(item.symbol)}>
                <Image src={item.world.poster.replace(".png", "-thumb.webp")} alt="" width={120} height={120} />
                <span><strong>{item.name}</strong><small>${item.symbol}</small></span>
                <Arrow />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <CollectionFooter />
    </div>
  );
}
