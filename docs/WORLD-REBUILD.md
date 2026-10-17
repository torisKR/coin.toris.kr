# Character world rebuild

The three character worlds retain the existing page layout, routes, token identities and controls. The approved concepts remain in `public/worlds/concepts/` as reference artwork. Public posters, selector thumbnails, detail cards, sharing artwork and studio poses now use renders of the actual Blender geometry.

## Source and regeneration

- Blender 5.1.2, EEVEE, AgX, three area lights and an orthographic 3/4 camera.
- `assets/blender/{pebr,yeti,xmasr}-world.blend` preserves the camera, lights, packed surface textures and NLA tracks. Environment meshes are visible in the saved files.
- `scripts/build_toris_worlds.py` builds the models deterministically. It uses authored meshes and Blender primitives; no paid generation service or downloaded mesh is required.
- Surface height fields for linen, rattan, brushed alloy, snow, vinyl, fur and golf-ball dimples are evaluated into 512-square tangent normal maps. UVs and tangent vectors are exported in the GLBs. Textures are packed into both the blend files and GLBs.

```sh
blender --background --python scripts/build_toris_worlds.py
node scripts/build_world_images.mjs
```

For a quick EEVEE preview, append `-- --symbol PEBR --preview`. Previews are written to `artifacts/rebuild/`. The final images are 1200-square world posters, 600-square mobile posters, 480-square thumbnails, nine transparent 1080-square PNG poses, 800-square preview WebPs and a 1200 by 630 share image. PNG and GLB public paths remain unchanged.

The characters are stylized modeled interpretations of the concept references. The photographic garden/alpine backgrounds in those references are represented by editable diorama scenery; they are not reproduced as a photographic backdrop.

## Official Blender Lab MCP

Official source: https://projects.blender.org/lab/blender_mcp and https://www.blender.org/lab/mcp-server/.

The installed official Blender Lab extension (`bl_ext.blender_lab.mcp`) was used with a separate Python environment at `/Users/toris/.local/share/blender-lab-mcp-venv`. This avoids replacing the existing third-party `blender-mcp` installation. Codex registration is named `blender-lab`, with `BLENDER_MCP_HOST=localhost`, `BLENDER_MCP_PORT=9876`, and the environment's `blender-mcp` executable. Restarting the Codex client may be needed for a new registration to appear in its tool inventory.

The official background bridge can be started with:

```sh
blender --background assets/blender/pebr-world.blend --command blender_mcp
```

The connection was verified using the official MCP `get_objects_summary` and `execute_blender_code` tools. The initial audit found no camera and no lights in the old blend. The first new PEBR preview was rendered using the official `execute_blender_code_for_cli` tool. Construction then used the same versioned bpy script through Blender's CLI. This separates the verified MCP connection from subsequent command-line builds. Background-bridge operator context lacks some interactive context members; the official CLI tool provides the appropriate context for primitive/modifier operations.

## Animation and renderer

The GLBs use Y-up and two NLA-derived clips: `Idle` (3.2 s) and `Action` (PEBR 2 s, YETI 2.4 s, XMASR 3 s). Animated arms contain the hands and props; PEBR additionally counter-rotates its wrist to keep the coffee level. Yeti has anticipation, swing, ball travel and return. Rocket ignition, lights, ascent and return are in the authored clip.

`CoinWorld` uses `AnimationMixer`, a filtered room environment for metal/lens reflections, three lights, contact shadows and an orthographic camera matched to the model posters. Rotation responds to drag/keyboard only. Pause freezes the mixer during an action as well as during idle. Reduced-motion starts paused; an explicit action request resumes playback. Hidden/offscreen worlds suspend frame scheduling without advancing animation time. A cancelled drag does not activate an action.

Loading is abortable, late decoded models are disposed, and unmount releases mixer bindings, geometries, materials, image bitmaps, textures, environment target, shadow map and WebGL context. A failed model leaves the actual model poster visible with disabled 3D controls. Mobile home keeps its existing poster-first opt-in behavior and loads only the selected world's GLB.

## Verification

Asset and browser checks are reproducible with:

```sh
# Isolated QA tools, outside the application dependencies:
npm install --prefix /tmp/pepebear-qa playwright @axe-core/playwright gltf-validator lighthouse sharp
node scripts/verify_world_assets.mjs
npm run build:cloudflare
PORT=3002 node scripts/preview-static.mjs
node scripts/verify_world_browser.mjs
```

`PEPEBEAR_QA_TOOLS` overrides the QA dependency location. `QA_BASE_URL` and `QA_OUTPUT` select the browser target and receipt directory. Current release results and limitations are recorded in `artifacts/rebuild/` and the release record.

Browser testing is desktop Chrome with software WebGL and mobile touch emulation. It is not a physical Android/iOS device test or long-duration GPU-memory profiling.

## Verified model budgets

| World | GLB bytes | Triangles | Action |
|---|---:|---:|---:|
| PEBR | 3,061,704 | 50,116 | 2.0 s |
| YETI | 3,070,020 | 50,309 | 2.4 s |
| XMASR | 1,957,652 | 30,178 | 3.0 s |

The asset verifier checks file/triangle/texture budgets, glTF validation (zero errors and warnings), exact clip names/durations, return to the starting pose for every animated channel, transparent pose dimensions, and arm/prop hierarchy.

The isolated release build passed the full browser suite: eight routes, widths 360/390/768/1440, zero axe violations, three authored actions, pause during idle and action, cumulative drag detection, keyboard controls, offscreen suspension, nine world switches with one renderer, three 1080 PNG exports, touch drag/tap, reduced motion, aborted model loading and real WebGL context-loss fallback. No browser page errors were observed. Lint passes with one existing unused-disable warning in `TokenHolders.tsx`.
