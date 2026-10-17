# Toris Coin world collection release

Release date: October 17, 2026.

## Product scope

The English Toris Coin site presents PEPEBear (PEBR), Yeti (YETI), and XMasRocket (XMASR) with equal collection status. The canonical detail routes remain `/coin/PEBR`, `/coin/YETI`, and `/coin/XMASR`; the shared editor lives at `/studio` and the legacy PEBR meme route remains compatible.

Each world has an editable Blender source, a web GLB, a rendered poster, three transparent poses, and an image-generated concept fallback. Original Pump.fun token artwork and exact mint identifiers remain visible on the detail pages. See `docs/ASSET-PROVENANCE.md` and `artifacts/collection-image-sources.json`.

## Interaction and fallback contract

- The homepage loads one selected world at a time. On mobile it presents the poster first and starts WebGL only after the visitor chooses `Open 3D world`.
- PEBR raises its coffee, YETI swings and moves the green ball, and XMASR lights and launches before returning.
- Drag, arrow-key rotation, Enter or Space action, pause, and play are supported.
- Reduced-motion starts paused. Rendering stops offscreen and while the page is hidden.
- A poster and normal navigation remain available if WebGL or model loading fails.
- Toris Coin Studio supports all three coins, three poses and three backgrounds per coin, local 1080 by 1080 PNG export, and an X draft link.

## Local verification

`artifacts/world-qa.json` records the final production-build browser run. It covers eight content routes, 360, 390, 768, and 1440 pixel widths, one H1 per route, horizontal overflow, axe WCAG 2 and 2.1 A/AA checks, single-world loading, keyboard selection, each character action, studio coin switching, 1080 PNG export, legacy query compatibility, mobile poster-first behavior, and reduced motion. The run completed without uncaught page errors or automated accessibility violations.

`npm run build:cloudflare` passed with all 19 static routes generated. ESLint passed with zero errors and one pre-existing unused-disable warning in `components/TokenHolders.tsx`, which is outside the new collection path.

Local mobile Lighthouse on the uncompressed preview server recorded Performance 82, Accessibility 100, Best Practices 100, and SEO 100. FCP and LCP were 3.6 seconds, TBT 20 ms, and CLS 0. The performance target must be evaluated again on Cloudflare, where static assets are compressed; this local score is not represented as a production pass or field Core Web Vitals evidence.

## Release evidence

Cloudflare deployment version and public verification are recorded in `docs/CLOUDFLARE-RELEASE.md` after deployment. Browser screenshots and the current lab report are stored under `artifacts/world-*`.
