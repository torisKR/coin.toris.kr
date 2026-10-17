import { MINT, SITE_URL, X_URL } from "./site";

export const CREATOR_ADDRESS = "EXBH2LjkJGRa3Nv2uGgtBX8afr4p4Tz1Judmdj6dQryy";
export const CREATOR_URL = `https://pump.fun/profile/${CREATOR_ADDRESS}`;
export const COLLECTION_X = "https://x.com/toris_kr";
export const VERIFIED_DATE = "2026-10-15";
export type CoinSymbol = "PEBR" | "YETI" | "XMASR";
export type Coin = {
  symbol: CoinSymbol;
  name: string;
  number: string;
  mint: string;
  image: string;
  imageAlt: string;
  theme: "bear" | "snow" | "rocket";
  line: string;
  description: string;
  social?: string;
  world: {
    glb: string;
    poster: string;
    conceptPoster: string;
    actionLabel: string;
    actionDescription: string;
  };
  poses: readonly [string, string, string];
  studioBackgrounds: readonly [
    { name: string; colors: readonly [string, string] },
    { name: string; colors: readonly [string, string] },
    { name: string; colors: readonly [string, string] },
  ];
};
export const coins: readonly Coin[] = [
  {
    symbol: "PEBR",
    name: "PEPEBear",
    number: "01",
    mint: MINT,
    image: "/coins/PEBR.webp",
    imageAlt: "PEPEBear original Pump.fun token artwork",
    theme: "bear",
    line: "A little green. A little unserious.",
    description:
      "The green bear of the collection. Step into PEPEBear’s world, get to know PEBR, and make a meme of your own.",
    social: X_URL,
    world: {
      glb: "/worlds/pebr-world.glb",
      poster: "/worlds/pebr-poster.png",
      conceptPoster: "/worlds/concepts/pebr-concept.webp",
      actionLabel: "Raise the coffee",
      actionDescription: "PEPEBear lifts a cup to say hello.",
    },
    poses: [
      "/worlds/poses/pebr-1.png",
      "/worlds/poses/pebr-2.png",
      "/worlds/poses/pebr-3.png",
    ],
    studioBackgrounds: [
      { name: "Garden", colors: ["#dcefc8", "#7eb36d"] },
      { name: "Coffee", colors: ["#f4e6c8", "#b77943"] },
      { name: "Night mint", colors: ["#173b32", "#79bd86"] },
    ],
  },
  {
    symbol: "YETI",
    name: "Yeti",
    number: "02",
    mint: "CGevbJ3ceVXjSCnSZJjjoK1Lpx5u1vrg3BYj8kRvpump",
    image: "/coins/YETI.webp",
    imageAlt: "Yeti original Pump.fun token artwork",
    theme: "snow",
    line: "A legend with a ticker.",
    social: "https://x.com/Yeti_Sports",
    description:
      "Meet Yeti, the elusive character in the collection. Explore its original artwork and find the exact YETI token on Solana.",
    world: {
      glb: "/worlds/yeti-world.glb",
      poster: "/worlds/yeti-poster.png",
      conceptPoster: "/worlds/concepts/yeti-concept.webp",
      actionLabel: "Take the swing",
      actionDescription: "Yeti swings the club and sends the green ball across the snow.",
    },
    poses: [
      "/worlds/poses/yeti-1.png",
      "/worlds/poses/yeti-2.png",
      "/worlds/poses/yeti-3.png",
    ],
    studioBackgrounds: [
      { name: "Fresh snow", colors: ["#f2f8ff", "#9bc9e9"] },
      { name: "Ice green", colors: ["#d8f3ef", "#58a891"] },
      { name: "Blue hour", colors: ["#182a4a", "#5b8dc4"] },
    ],
  },
  {
    symbol: "XMASR",
    name: "XMasRocket",
    number: "03",
    mint: "6HHVy15ixQudWkgv8fRW8w4pHbqBgdVEAqbVxZN7pump",
    image: "/coins/XMASR.webp",
    imageAlt: "XMasRocket original Pump.fun token artwork",
    theme: "rocket",
    line: "Holiday spirit. Rocket energy.",
    social: "https://x.com/AIAGENT_sol",
    description:
      "A festive addition to the collection. Meet XMasRocket, explore its artwork, and check the XMASR token at the source.",
    world: {
      glb: "/worlds/xmasr-world.glb",
      poster: "/worlds/xmasr-poster.png",
      conceptPoster: "/worlds/concepts/xmasr-concept.webp",
      actionLabel: "Start the launch",
      actionDescription: "The lights pulse, ignition glows, and the rocket rises before returning.",
    },
    poses: [
      "/worlds/poses/xmasr-1.png",
      "/worlds/poses/xmasr-2.png",
      "/worlds/poses/xmasr-3.png",
    ],
    studioBackgrounds: [
      { name: "Launch night", colors: ["#08152f", "#315b91"] },
      { name: "Holiday red", colors: ["#52141c", "#c94a4a"] },
      { name: "Evergreen", colors: ["#0d3027", "#3b7455"] },
    ],
  },
];
export const coinPath = (symbol: CoinSymbol) => `/coin/${symbol}`;
export const coinUrl = (symbol: CoinSymbol) => `${SITE_URL}${coinPath(symbol)}`;
export const pumpUrl = (coin: Coin) => `https://pump.fun/coin/${coin.mint}`;
export const explorerUrl = (coin: Coin) =>
  `https://solscan.io/token/${coin.mint}`;
export const findCoin = (symbol: string) =>
  coins.find((coin) => coin.symbol === symbol);
