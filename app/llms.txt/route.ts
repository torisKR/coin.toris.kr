import { SITE_URL } from "@/utils/site";
import {
  coins,
  coinUrl,
  pumpUrl,
  CREATOR_URL,
  CREATOR_ADDRESS,
} from "@/utils/coins";
export const dynamic = "force-static";
export function GET() {
  return new Response(
    `# Toris Coin

> Toris Coin is a creator portfolio for three Solana meme coins: PEPEBear (PEBR), Yeti (YETI), and XMasRocket (XMASR). Each appears in the created-coins list on the same Pump.fun profile. This is a curated collection, not an exchange or a live market-data service.

## Creator
- [Pump.fun creator profile](${CREATOR_URL})
- Creator wallet: ${CREATOR_ADDRESS}
- Identity, original artwork and creator-list membership checked October 15, 2026.

## Coins
${coins.map((coin) => `- [${coin.name} (${coin.symbol})](${coinUrl(coin.symbol)}): ${coin.description}\n  - Network: Solana\n  - Mint: ${coin.mint}\n  - [Pump.fun source](${pumpUrl(coin)})`).join("\n")}

## Explore
- [Collection](${SITE_URL}/): Three selectable character worlds and individual pages.
- [Toris Coin Studio](${SITE_URL}/studio): PEBR, YETI and XMASR poses, coin-specific backgrounds, captions and local 1080 by 1080 PNG export.
- [PEBR token facts](${SITE_URL}/coin/PEBR/token)
- [Legacy PEBR studio route](${SITE_URL}/coin/PEBR/memes): Opens the shared editor with PEBR selected and preserves template links.
- [PEBR Markdown facts](${SITE_URL}/token-facts.md)
- [Privacy and optional analytics](${SITE_URL}/privacy)

## Limits
Meme tokens are speculative and may lose all value or have limited liquidity. No guaranteed returns, rewards, staking or airdrops are offered here. Current supply, token authorities, holder concentration, liquidity and market metrics are not verified by this website. The 3D worlds are new interpretations; each detail page retains original artwork and public source links. Existing /PEBR paths redirect to /coin/PEBR.
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
