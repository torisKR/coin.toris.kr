# Toris Coin

The source for [coin.toris.kr](https://coin.toris.kr), an English art-toy collection for PEPEBear (PEBR), Yeti (YETI), and XMasRocket (XMASR).

Each coin has an interactive Three.js world backed by an editable Blender file and a web-ready GLB. Toris Coin Studio combines all three characters in one browser-only meme editor with 1080 by 1080 PNG export.

![Toris Coin collection](public/worlds/toris-coin-og.webp)

## Routes

- `/` - selectable collection viewer; only the active GLB is loaded.
- `/coin/PEBR` - green bear coffee garden and cup-raise action.
- `/coin/YETI` - snow golf world, swing action, and moving green ball.
- `/coin/XMASR` - Christmas launch pad, lights, ignition, and lift action.
- `/studio?coin=YETI` - shared coin, pose, background, caption, and PNG editor.
- `/coin/PEBR/memes?template=coffee` - retained legacy route and template link.
- `/coin/PEBR/token` - retained PEBR facts and risk information.
- `/privacy` - optional analytics settings and data-use explanation.

The detail pages retain the original token artwork, exact mint address, Pump.fun source, Solscan record, and creator profile. The site does not present live price or liquidity data.

## Run locally

```sh
npm install
npm run dev
```

Then open `http://localhost:3000`. Production checks:

```sh
npm run lint
npm run build:cloudflare
```

## Build and deploy to Cloudflare

This project has no Wrangler configuration. Use the `cf` CLI:

```sh
cf deploy --prebuilt --mode production --dry-run
cf deploy --prebuilt --mode production
```

`cloudflare.config.ts` keeps the existing Worker and `coin.toris.kr` custom-domain configuration separate from the GitHub repository name. `.cloudflare/` is generated output and is not committed.

## Regenerate 3D assets

Blender 5.1 or later can rebuild the editable scenes, GLBs, model posters, and three transparent poses per coin:

```sh
blender --background --python scripts/build_toris_worlds.py
```

Outputs:

- Editable sources: `assets/blender/*-world.blend`
- Web models: `public/worlds/*-world.glb`
- Model posters: `public/worlds/*-poster.png`
- Transparent poses: `public/worlds/poses/*.png`

The source script uses Blender primitives and named action objects (`CharacterRoot`, `ActionPivot`, and `ActionBall`). `components/CoinWorld.tsx` uses those names for the browser interactions. Keep them stable when editing the models.

The high-resolution concept posters in `public/worlds/concepts/` were generated from the original token artwork and are used as immediate mobile/loading fallbacks. See [asset provenance](docs/ASSET-PROVENANCE.md) for prompts, dimensions, and generation notes.

## Add a coin

1. Extend `CoinSymbol` and add the verified identity, original art, world files, three poses, and three studio backgrounds in `utils/coins.ts`.
2. Add a Blender builder to `scripts/build_toris_worlds.py` with the same named interaction objects.
3. Rebuild the assets and update the provenance document.
4. Confirm the static detail route, sitemap, `llms.txt`, studio export, analytics `coin_symbol`, and both light and dark presentation.

The collection, detail navigation, sitemap, metadata, studio, and analytics all read from the same coin registry.

## Analytics and verification

- [Analytics plan](docs/ANALYTICS-PLAN.md) documents consent and GA4 events.
- [Asset provenance](docs/ASSET-PROVENANCE.md) distinguishes original token images, generated concepts, and Blender outputs.
- [Collection release notes](docs/COLLECTION-RELEASE.md) record browser and deployment checks.
- `artifacts/world-verify.mjs` is the Playwright and axe verification harness.

GA4 property `coin` uses measurement ID `G-ZXLWF2WZ3H` only on the public production hostname and only after permission. Existing event names are preserved; studio download and X-draft events record the selected `coin_symbol`.
