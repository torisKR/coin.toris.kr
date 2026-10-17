import { MINT, SITE_URL, PUMP_URL, EXPLORER_URL, X_URL } from "@/utils/site";
export const dynamic = "force-static";
export function GET() {
  return new Response(
    `# PEPEBear (PEBR) token facts

Source page: ${SITE_URL}/coin/PEBR/token
Identity checked: October 15, 2026, using the Pump.fun listing and linked X profile.

PEPEBear (PEBR) is a meme token on Solana, listed on Pump.fun. The full mint address identifies this token; names, images and tickers alone do not.

- Name: PEPEBear
- Ticker: PEBR
- Network: Solana
- Mint: ${MINT}
- Pump.fun: ${PUMP_URL}
- Solscan: ${EXPLORER_URL}
- Linked social profile: ${X_URL}
- Pump.fun creator label observed: torisdev. This platform label is not an independent identity verification.

## Participation
Create a meme at ${SITE_URL}/coin/PEBR/memes or join the conversation on X. No wallet or token purchase is required. The site offers no staking, airdrops, points, or financial rewards.

## Risks and unknowns
PEBR is speculative. Its value can fall to zero and liquidity may be limited. This site does not verify current supply, token authorities, holder concentration, liquidity, or availability on other venues, and does not display live market data. Check external source timestamps. There are no guaranteed returns. Creating or sharing a meme does not earn tokens.
`,
    { headers: { "Content-Type": "text/markdown; charset=utf-8" } },
  );
}
