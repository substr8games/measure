# THE MEASURE — REV43 / HOMEPAGE FILTER + ORACLE WIRE

## Rule

Curiosities remain available under their own section, in search and in the archive, but are excluded from the landing page's hero, latest stories, series preview, and Lower Register. Ordinary paid/satirical advertisements remain available in the dedicated ad rail and register. Leaving the front page restores the broader Lower Register.

The BREAKING ticker must render when BREAKING articles exist and must not depend on the manifest already containing BREAKING records. A separate Oracle catalog supplies six initial fictional news dispatches. Each is a readable, linked article filed under BREAKING, not an inert ticker string. Newly published SNIPE BREAKING articles join the pool and supersede starter dispatches if their IDs match.

## Data

- `resources/breaking-wire.json` — six canonical, editable starter dispatches, retaining the supplied headlines and full article text. Stored separately from the live `manifest.json` so an overlay cannot overwrite real publications.
- `resources/phi-labs-copy.json` — existing reusable Phi Labs separator copy, independent of the dispatches.
- `manifest.json` — the existing SNIPE publication index; the ticker selects only records filed under BREAKING from this manifest plus the starter catalog, deduplicates and sorts by publication date, and displays the newest 15.

Both sources are fetched independently. New SNIPE-published records become navigable as the ticker updates. Seeded entries appear in the BREAKING section, the archive, and at their individual `#/article/oracle-*` links, but do **not** displace regular articles in the home feature/latest slots.

## Presentation

- Ticker stays pinned to the viewport bottom, with reserved document space so it cannot obscure the Lower Register or footer.
- Every item is prefaced `BREAKING:` and separated by randomized Phi Labs copy.
- Hide ticker and its reserved space on individual article routes, including seeded Oracle dispatches.
- Pause on hover/focus and respect reduced-motion preferences.
- Refresh published BREAKING selection every three minutes, independent of the Lower Register.

## Delivery

Extract into the **website repository root**. The overlay contains `index.html` and the two `resources/*.json` catalogs. It does not replace `manifest.json`, SNIPE, existing article files, or any of the publication's artwork.

## Verification

JSON syntax, source-structure, relative paths, and ZIP integrity checked. Local HTTP delivery verified. Headless Chromium could not complete startup in this environment; browser rendering and live GitHub publication remain unverified.
