import { defineConfig, triggers } from "cf/config";
export default defineConfig({
  accountId: "7d03872efb9b1d7451137659464e6065",
  worker: {
    name: "toris-coin",
    compatibilityDate: "2026-10-15",
    assets: {
      htmlHandling: "drop-trailing-slash",
      notFoundHandling: "404-page",
    },
    domains: ["coin.toris.kr"],
    triggers: [
      triggers.fetch({ pattern: "coin.toris.kr/*", zone: "toris.kr" }),
    ],
  },
});
