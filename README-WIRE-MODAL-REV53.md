# THE MEASURE — THE WIRE Modal — Rev53 Overlay

**Basis:** The Measure Rev52 Dual RSS Discovery `index.html`; MEASURE-WIRE-001 and MEASURE-WIRE-002; approved THE WIRE standalone Rev03.

## Apply

Unzip this overlay **at the The Measure repository root**, so its `index.html` replaces Rev52's `index.html` and its `games/wire/` folder is added. Merge into the existing repo, not a new empty directory. Preserve all other files.

Do not deploy the SNIPE source, Cloudflare Worker, or private puzzle JSON to this public GitHub Pages repo.

## Local demo / no Cloudflare required

The modal launches from the `THE WIRE` navigation entry or the Play section. Without Worker configuration, it presents a clearly labeled **unranked, fictional practice puzzle**. No official leaderboard is shown. The game has ten independently shuffled nodes, nine wire segments, five verified matches, and a static hex background with event-driven effects.

The HTML fragment and strings are loaded using `fetch()`, so for local testing **serve this directory over HTTP or HTTPS** using an existing static server, or test on GitHub Pages. Opening `index.html` directly via `file://` may block local asset requests in some browsers.

## Activate verified daily games

1. Deploy the separate Cloudflare Worker/D1 bundle using its README.
2. Edit **`games/wire/config.json`** and enter the deployed Worker origin as `workerUrl`, for example `https://the-wire.<your-workers-subdomain>.workers.dev`. Do **not** append `/wire`, and do **not** include tokens here.
3. Add the published website origin to Worker `WIRE_SITE_ORIGINS` (scheme + hostname + any port; not `/measure` path).
4. Upload/schedule the day's puzzle using the separate SNIPE Games manager. It will appear automatically at Pacific midnight.
5. Verify GET `/wire/today` returns public metadata only and a ranked run receives shuffled node IDs only after `BEGIN`.

## Host behavior

- `<dialog>` overlays the current SPA route; exit returns to the original route/scroll/focus.
- Break ticker is concealed only while modal is open, then its original behavior resumes.
- The modal's CSS lives within a ShadowRoot; publication CSS is not globally reset.
- A running ranked session remains active when the dialog closes. Its token is stored in browser sessionStorage for the existing tab, and reopening restores progress via `/wire/session`.
- The single static hex SVG replaces animated background work. Canvas is idle until a connection or victory effect; 30FPS cap and reduced motion.
- Only a linked article whose ID actually exists in the currently loaded publication index offers `READ THE INVESTIGATION`.

## Limits / validation

Source and packaging checks are provided with the bundle. A real browser visual pass, Cloudflare deployment, and a complete D1-ranked end-to-end run must still be performed in your target environment. No service credentials are included.

**Licensing:** All Rights Reserved unless Director states otherwise.
