export const MINT = "7Ndrtiq37uU48cua8VVry31ygZPTAJSWwtCDhHBnpump";
export const PUMP_URL = `https://pump.fun/coin/${MINT}`;
export const EXPLORER_URL = `https://solscan.io/token/${MINT}`;
export const X_URL = "https://x.com/PEBR_Coin";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://coin.toris.kr"
).replace(/\/$/, "");
export const DESCRIPTION =
  "Meet PEPEBear (PEBR), the green bear meme token on Solana. Make a meme, explore the community, and verify its token address through Pump.fun and Solscan.";
export const faqs = [
  {
    question: "What is PEPEBear (PEBR)?",
    answer:
      "PEPEBear (PEBR) is a meme token on the Solana blockchain, listed on Pump.fun. Its identity centers on a green bear with sunglasses and a crown. This site brings together its token address, public links, and a meme studio for community participation.",
  },
  {
    question: "What is the PEPEBear token address?",
    answer: `The Solana mint address is ${MINT}. Compare the full address on Pump.fun and Solscan. Names and tickers can be copied; the full mint address identifies this token.`,
  },
  {
    question: "Do I need to buy PEBR to join in?",
    answer:
      "No. You can create and download a meme, follow @PEBR_Coin on X, and take part in the conversation without owning tokens or connecting a wallet.",
  },
  {
    question: "Where can I check PEBR market information?",
    answer:
      "Open the linked Pump.fun listing for available market information and Solscan for on-chain token records. This site does not publish live prices, liquidity, holder counts, or trading volume. Check the source and timestamp before relying on any figure.",
  },
  {
    question: "Are there rewards, staking, or guaranteed returns?",
    answer:
      "This site offers no staking, airdrops, points, or financial rewards. PEBR is a speculative meme token. Its value can fall to zero and liquidity may be limited. Creating or sharing a meme does not earn tokens.",
  },
];
