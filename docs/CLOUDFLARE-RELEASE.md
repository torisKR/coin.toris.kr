# Toris Coin Cloudflare release

Release date: October 17, 2026.

## Architecture

The existing `toris-coin` Cloudflare Worker serves the exported Next.js site at `coin.toris.kr`. Repository renaming is independent of the Worker and domain configuration.

This project intentionally has no Wrangler configuration. `npm run build:cloudflare` creates a static Next.js export and `scripts/build-cloudflare.mjs` packages only that output. Deployment uses the `cf` CLI:

```sh
cf deploy --prebuilt --mode production --dry-run
cf deploy --prebuilt --mode production
```

The dry run read 164 files from `.cloudflare/output/v0/workers/default/assets` and found no bindings. No source files, local environment files, or credentials are public assets.

## Deployment status

- Worker version: `04866be0-5b7e-4764-b35f-67a5ff294ee7`.
- The `coin.toris.kr/*` zone trigger and `coin.toris.kr` custom domain were deployed by the `cf` CLI.
- `/`, `/studio?coin=YETI`, all three canonical coin routes, and static assets returned successfully through Cloudflare. `/PEBR` returned 301 to `/coin/PEBR`; an unknown route returned 404.
- `artifacts/world-qa.json` records the complete public browser run with no page errors and no axe violations across the eight tested content routes.
- `artifacts/world-lighthouse-production.json` records Performance 96, Accessibility 100, Best Practices 100, and SEO 100 on the public mobile lab profile.
- `artifacts/world-analytics-qa.json` confirms that no GA tag, event, or analytics cookie was present before consent. After consent, page, coin, mint-copy, studio-download, and X-draft events reached measurement ID `G-ZXLWF2WZ3H` with HTTP 204; YETI and XMASR actions carried the selected `coin_symbol`.

The current environment did not expose an authenticated Google Analytics browser session for a report-side Realtime readback. The transport receipt is verified; visibility in the Realtime dashboard is not claimed by this release evidence.
