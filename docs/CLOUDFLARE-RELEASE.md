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

## Earlier world release status

- Worker version: `04866be0-5b7e-4764-b35f-67a5ff294ee7`.
- The `coin.toris.kr/*` zone trigger and `coin.toris.kr` custom domain were deployed by the `cf` CLI.
- `/`, `/studio?coin=YETI`, all three canonical coin routes, and static assets returned successfully through Cloudflare. `/PEBR` returned 301 to `/coin/PEBR`; an unknown route returned 404.
- `artifacts/world-qa.json` records the complete public browser run with no page errors and no axe violations across the eight tested content routes.
- `artifacts/world-lighthouse-production.json` records Performance 96, Accessibility 100, Best Practices 100, and SEO 100 on the public mobile lab profile.
- `artifacts/world-analytics-qa.json` confirms that no GA tag, event, or analytics cookie was present before consent. After consent, page, coin, mint-copy, studio-download, and X-draft events reached measurement ID `G-ZXLWF2WZ3H` with HTTP 204; YETI and XMASR actions carried the selected `coin_symbol`.

The current environment did not expose an authenticated Google Analytics browser session for a report-side Realtime readback. The transport receipt is verified; visibility in the Realtime dashboard is not claimed by this release evidence.

## Character rebuild release - October 17, 2026

- Implementation commit: `0653887c323fb40007be55559ad26cbd7b76c99b`, pushed to `origin/main` and checked against the remote SHA.
- Worker version: `5df1a578-280d-4619-8f77-b7eb7ccdbcee` at https://coin.toris.kr.
- Deployed with `cf deploy --prebuilt --mode production` from an isolated directory containing HEAD plus only the selected implementation files. Existing `Header.tsx` edits and unrelated untracked files were excluded. The isolated build, lint and browser suite passed before deployment. The dry run found 180 static output files and no bindings.
- Public GLBs, mobile posters, action-pose PNGs and share artwork were compared to local assets with SHA-256; every checked file matched. Canonical routes return 200, `/PEBR` returns 301 to `/coin/PEBR`, and an unknown route returns 404. Receipt: `artifacts/rebuild/public-assets-and-routes.json`.
- Public mobile Lighthouse: Performance **94**, Accessibility **100**, Best Practices **100**, SEO **100**. The local uncompressed preview measured 79; the public compressed Cloudflare output is the release performance result. Full public receipt: `artifacts/rebuild/lighthouse-public.json`.
- Geometry, textures and animation budgets: `artifacts/rebuild/assets-qa.json`; editable scene camera/light/visibility audit: `artifacts/rebuild/blender-final-audit.json`.
- Character fabrication and regeneration: `docs/WORLD-REBUILD.md`. Visual comparison: `artifacts/rebuild/visual-comparison.webp`.

Physical Android/iOS device testing and long-duration GPU-memory profiling were not performed. Browser touch evidence uses mobile emulation. The models are stylized dioramas based on the approved references; the references' photographic environments are retained as reference images, not presented as the real-time model.

The complete public browser run also passed with zero axe violations on all eight tested pages and zero page errors. It verified all three actions and pause/resume, drag and keyboard rotation, offscreen suspension, nine world switches, poster-first mobile loading with touch drag/tap, three 1080 PNG downloads, failed-model fallback, renderer disposal after WebGL context loss and reduced-motion initialization. Receipt: `artifacts/rebuild/public/qa.json`; a public studio export and homepage/touch screenshots are stored beside it.
