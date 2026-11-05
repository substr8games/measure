# THE MEASURE — REV41 / BREAKING WIRE

## Rule

The BREAKING ticker is a fixed viewport-bottom strip, not a Lower Register overlay. It is suppressed while viewing an individual article (`#/article/...`). All other publication routes may display it when BREAKING articles are present.

## Data

- Read `manifest.json` without cache; select records of type `article` filed under `breaking` by primary `section` or the `sections` array.
- Sort by publication date descending; keep at most 15 unique records; link to their single canonical article routes.
- Prefix **each** headline with `BREAKING:`.
- Interleave reusable copy selected from `resources/phi-labs-copy.json` (schema `phi-labs.copy-lines.v1`). The catalog is independent of article data for reuse elsewhere.
- Refresh the selected 15 records every three minutes while the ticker is visible; do not reload the page or refresh unrelated publication modules. Avoid unnecessary rerenders when the selected headlines have not changed.

## Layout

- Fixed at the bottom of the visible screen.
- Reserve the ticker height in document flow when visible so readers can scroll the Lower Register and footer entirely above it.
- Hide both ticker and reserved space on article routes.
- Pause scrolling on hover/focus; respect reduced-motion settings.

## Installation

Extract the overlay at The Measure's website root. The archive contains `index.html` and `resources/phi-labs-copy.json`.

## Verification

Static source and JSON checks completed. Graphical browser and live deployment testing were not completed in this environment.
