import { AnalyticsSettingsButton } from "./SiteAnalytics";
import Link from "next/link";
import { COLLECTION_X, CREATOR_URL } from "@/utils/coins";

export function Arrow({ diagonal = true }: { diagonal?: boolean }) {
  return (
    <span className="island-arrow" aria-hidden="true">
      {diagonal ? "↗" : "↓"}
    </span>
  );
}
export function CollectionNav() {
  return (
    <header className="collection-nav collection-width">
      <Link href="/" className="collection-brand">
        <span className="collection-mark" aria-hidden="true">
          t.
        </span>
        <span>
          toris<span className="brand-light">coin</span>
        </span>
      </Link>
      <nav aria-label="Collection navigation">
        <Link href="/#collection">Collection</Link>
        <Link href="/studio" prefetch={false}>Studio</Link>
        <a href={CREATOR_URL} target="_blank" rel="noopener noreferrer">
          Pump.fun <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}
export function CollectionFooter() {
  return (
    <footer className="collection-footer collection-width">
      <div className="collection-footer-top">
        <Link href="/" className="collection-brand">
          toris<span className="brand-light">coin</span>
        </Link>
        <p>
          Independent characters.
          <br />A shared corner of the internet.
        </p>
        <nav aria-label="Collection footer">
          <a href={CREATOR_URL} target="_blank" rel="noopener noreferrer">
            Creator on Pump.fun ↗
          </a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/studio" prefetch={false}>Studio</Link>
          <AnalyticsSettingsButton />
          <a
            href="https://github.com/torisKR/coin.toris.kr"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <a href={COLLECTION_X} target="_blank" rel="noopener noreferrer">
            @toris_kr on X ↗
          </a>
        </nav>
      </div>
      <div className="collection-footer-bottom">
        <p>
          Meme tokens are speculative. You could lose everything you spend, and
          liquidity may be limited. No guaranteed returns. No wallet is needed
          to explore this collection.
        </p>
        <span>© {new Date().getFullYear()} Toris Coin</span>
      </div>
    </footer>
  );
}
