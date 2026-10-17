import type { Metadata } from "next";
import Link from "next/link";
import { CopyMint } from "@/components/CopyMint";
import { MINT, PUMP_URL, EXPLORER_URL, X_URL } from "@/utils/site";
import { CollectionFooter, CollectionNav } from "@/components/CollectionChrome";

const description =
  "What is PEPEBear (PEBR)? Find its exact Solana mint address, Pump.fun listing, public sources, participation options, and clear token risk information.";
export const metadata: Metadata = {
  title: "PEBR Token Facts & Solana Mint Address",
  description,
  alternates: { canonical: "/coin/PEBR/token" },
  openGraph: {
    title: "PEBR token facts & mint address",
    description,
    siteName: "PEPEBear",
    type: "website",
    url: "/coin/PEBR/token",
    images: [
      {
        url: "/worlds/concepts/pebr-concept.webp",
        width: 1200,
        height: 1200,
        alt: "PEPEBear (PEBR) token facts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PEBR token facts & mint address",
    description,
    creator: "@PEBR_Coin",
    images: ["/worlds/concepts/pebr-concept.webp"],
  },
};
export default function TokenPage() {
  return (
    <div className="collection-site toris-world-site">
      <CollectionNav />
      <main id="main" className="shell">
      <div className="page-intro">
        <Link href="/coin/PEBR" className="back-link">
          ← Back to the bear
        </Link>
        <br />
        <span className="eyebrow">PEPEBEAR / TOKEN REFERENCE</span>
        <h1>
          Meet the token.
          <br />
          <span className="serif">Check the facts.</span>
        </h1>
        <p>
          PEPEBear (PEBR) is a meme token on Solana, listed on Pump.fun. Its
          name and ticker are public labels; its full mint address is the
          identifier to compare when checking a listing or an on-chain record.
        </p>
      </div>
      <div className="token-detail-layout">
        <div>
          <section className="fact-sheet" aria-labelledby="facts-title">
            <h2 id="facts-title" className="eyebrow">
              PEBR AT A GLANCE
            </h2>
            <dl>
              <div>
                <dt>Token name</dt>
                <dd>PEPEBear</dd>
              </div>
              <div>
                <dt>Ticker</dt>
                <dd>PEBR</dd>
              </div>
              <div>
                <dt>Network</dt>
                <dd>Solana</dd>
              </div>
              <div>
                <dt>Listing</dt>
                <dd>
                  <a href={PUMP_URL} target="_blank" rel="noopener noreferrer">
                    Pump.fun ↗
                  </a>
                </dd>
              </div>
              <div>
                <dt>Social profile</dt>
                <dd>
                  <a href={X_URL} target="_blank" rel="noopener noreferrer">
                    @PEBR_Coin ↗
                  </a>
                </dd>
              </div>
              <div>
                <dt>Mint</dt>
                <dd>
                  <code>{MINT}</code>
                </dd>
              </div>
            </dl>
            <CopyMint />
          </section>
          <section className="prose">
            <h2>How to identify PEPEBear</h2>
            <ol>
              <li>Copy the complete mint address from this page.</li>
              <li>
                Open the{" "}
                <a href={PUMP_URL} target="_blank" rel="noopener noreferrer">
                  Pump.fun PEBR listing
                </a>{" "}
                and compare the full address.
              </li>
              <li>
                Use{" "}
                <a
                  href={EXPLORER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  the Solscan token record
                </a>{" "}
                to inspect available on-chain information. This is an external
                source; this site does not validate its data.
              </li>
            </ol>
            <p>
              A matching name, logo, or ticker alone does not establish token
              identity. This site will never ask for a seed phrase or a
              signature.
            </p>
            <h2>What this site provides</h2>
            <p>
              A home for the character, public token references, and a free meme
              studio. You can participate without buying PEBR. The site does not
              provide staking, token rewards, token-gated features, or an
              investment product.
            </p>
            <p>
              There are no price targets, return forecasts, or exchange listing
              promises here. An external listing does not establish liquidity,
              safety, or future value.
            </p>
          </section>
        </div>
        <aside className="prose">
          <span className="eyebrow">SOURCES & LIMITS</span>
          <h2>Know what you&apos;re reading.</h2>
          <p>
            The name, ticker, network and linked X profile were checked on the
            Pump.fun page on October 15, 2026. Pump.fun displayed the creator
            handle “torisdev.” This is a platform label, not an independent
            identity verification.
          </p>
          <p>
            Market cap, holder counts, supply and liquidity can change. This
            reference intentionally does not present them as live facts. Check
            the source, timestamp and units yourself.
          </p>
          <h2>Understand the risk</h2>
          <p>
            PEBR is a speculative meme token. Its value may fall to zero; low
            liquidity can make selling difficult or impossible. There is no
            guaranteed income, price, redemption value, or financial reward for
            participation.
          </p>
          <p>
            Historical social posts may mention other trading venues. Those
            statements are not proof of current liquidity or availability, so
            this site links to the checked Pump.fun listing.
          </p>
          <p className="verified-date">
            FACT CHECK: OCTOBER 15, 2026
            <br />
            Sources:{" "}
            <a href={PUMP_URL} target="_blank" rel="noopener noreferrer">
              Pump.fun
            </a>{" "}
            ·{" "}
            <a href={X_URL} target="_blank" rel="noopener noreferrer">
              X profile
            </a>
          </p>
          <h2>Here for the memes?</h2>
          <p>The green bear is happy to oblige.</p>
          <Link href="/coin/PEBR/memes" className="button button-dark">
            Open meme studio <span aria-hidden="true">↗</span>
          </Link>
        </aside>
      </div>
      </main>
      <CollectionFooter />
    </div>
  );
}
