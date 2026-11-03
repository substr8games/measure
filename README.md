# The Measure — Rev12 / One-Time Front-Page Placard

Complete replacement site file plus one bundled artwork asset.

## Install

Extract into the **The Measure site root**, merging the `images/` directory:

- `index.html` — replaces the existing site file, retaining the Rev11 advertiser galleries and layout.
- `images/adult-content-warning.png` — new artwork (required by the placard).

## Behavior

- On a **direct homepage visit** (`#/` or no hash), visitors who have not dismissed the warning see the artwork across the full viewport width.
- A strong blur and darkening effect completely obscures the site behind the placard.
- The green **well i never** button overlays the artwork's arrow/INSERT COIN area.
- Clicking the button closes the placard and saves the dismissal in the browser's local storage; the warning does not appear again in that browser unless its site data is cleared.
- A **direct article link** (`#/article/...`) and every other non-homepage route bypass the warning. Navigating to the home page from a deep link does not trigger it later in that visit.
- There is no dependency on SNIPE, scripts, external resources, or an authentication system.

## Validation

The file and bundled image were inspected, the ZIP integrity was checked, and the route, button, and persistence logic were checked at the source level. Chromium headless preview timed out in this environment; final visual browser behavior has not been verified.
