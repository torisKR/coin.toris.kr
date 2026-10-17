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

The final Worker version, public route checks, response headers, browser interaction run, production Lighthouse result, and GA4 delivery evidence are appended here after release.
