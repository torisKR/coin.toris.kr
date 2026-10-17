# Mascot asset provenance

- Output: `public/bear-mascot.png` (1280 × 1280 PNG with transparent background).
- Created October 15, 2026 with the built-in image_gen tool using the imagegen skill.
- Reference: existing project asset `public/logo.png`, inspected before generation.
- Purpose: consistent character artwork for the hero, starter memes and browser-based meme export. Existing source artwork is retained.
- This is generated artwork, not a depiction of real community activity or a financial endorsement. No external trademark affiliation is claimed.

## Final generation prompt

Use case: illustration-story. Asset type: PEPEBear meme token website hero mascot and meme creator illustration. Input image 1 is the character identity reference. Create a polished charming original illustration of this same chubby lime-green bear with rounded ears, black sunglasses, small gold crown, cream muzzle and cheeky happy smile. Seated casual pose, one paw making a peace sign, the other holding a small white coffee mug. Full body including feet, oversized head, consistent bold dark forest green outline, simple flat colors with gentle cel shading, playful hand drawn sticker art. Isolate the bear as a clean cutout on genuinely transparent background. Keep the recognizable bear identity, sunglasses and crown. No coins, no globe, no golf club, no space scenery, no money, no text, no logos, no watermark. Single character centered with generous breathing space, square composition.

## Original coin artwork added for the collection — October 15, 2026

`public/coins/PEBR.webp`, `YETI.webp` and `XMASR.webp` are local WebP conversions of the original token images from their Pump.fun coin pages, selected through the creator’s created-coins list using Aside browser. They are distinct from the custom generated PEPEBear meme mascot described above. Exact image URLs, IPFS references and observed dimensions are recorded in `artifacts/collection-image-sources.json`; no resolution increase or new AI image generation was used for these three assets. The homepage wraps the images on illustrative 3D medallions and labels that presentation accordingly.

`public/brand-mark.svg` is an original simple Toris Coin typographic mark; derived PNG and ICO assets replace the PEBR-only root icon.

## Three character worlds - October 17, 2026

The production world assets are regenerated with `blender --background --python scripts/build_toris_worlds.py`. The script uses Blender primitives and shared material, lighting, and camera rules. It writes editable `.blend` sources to `assets/blender/`, web GLBs to `public/worlds/`, 1200 by 1200 model posters, and three 800 by 800 transparent PNG poses per coin. The browser actions target named geometry in the GLB rather than a prerecorded video.

| Coin | Editable source | GLB | Model poster | Transparent poses |
|---|---|---|---|---|
| PEBR | `assets/blender/pebr-world.blend` | `public/worlds/pebr-world.glb` | 1200 by 1200 PNG | 3 at 800 by 800 PNG |
| YETI | `assets/blender/yeti-world.blend` | `public/worlds/yeti-world.glb` | 1200 by 1200 PNG | 3 at 800 by 800 PNG |
| XMASR | `assets/blender/xmasr-world.blend` | `public/worlds/xmasr-world.glb` | 1200 by 1200 PNG | 3 at 800 by 800 PNG |

High-resolution concept and loading posters were created with the built-in image generation tool, using each original token image as a character-identity reference. The final WebP files are 1200 by 1200 pixels:

- `public/worlds/concepts/pebr-concept.webp`: lime-green crowned bear with black sunglasses and cream muzzle in a garden coffee lounge, raising a white cup. The correction prompt explicitly excludes the original artwork's golf club, green orb, coin frame, text, and extra characters.
- `public/worlds/concepts/yeti-concept.webp`: crowned white yeti with a golf club and bright green ball in a snow-covered putting world. No text, extra animals, or coin frame.
- `public/worlds/concepts/xmasr-concept.webp`: silver rocket with gold star, holiday bulbs, red and green ribbons on a snowy night launch pad. No text, people, or coin frame.
- `public/worlds/toris-coin-og.webp`: 1200 by 630 collection share image generated from the three approved concept posters, with equal visual weight and no embedded text.

Each square concept also has a 600 by 600 `-mobile.webp` loading image and a 480 by 480 `-thumb.webp` selector image. The studio uses the 800 by 800 transparent PNG renders for its 1080 by 1080 export and smaller WebP copies for the live editor preview. These derivatives preserve the rendered composition while avoiding full-resolution downloads in the initial mobile view.

These generated posters are new interpretations, not original token art and not evidence of community activity. Original Pump.fun artwork stays visible on each detail page and remains documented in `artifacts/collection-image-sources.json`.
