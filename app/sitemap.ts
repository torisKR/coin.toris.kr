import type { MetadataRoute } from "next";
import { SITE_URL } from "@/utils/site";
import { coins, coinPath } from "@/utils/coins";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    ...coins.map((coin) => coinPath(coin.symbol)),
    "/studio",
    "/coin/PEBR/token",
    "/coin/PEBR/memes",
    "/privacy",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path === "/privacy" ? 0.2 : 0.8,
  }));
}
