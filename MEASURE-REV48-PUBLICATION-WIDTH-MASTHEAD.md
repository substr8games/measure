# The Measure — Rev48 — Publication-width masthead

## Change

The masthead PNG now scales to the existing publication frame: up to 1240px wide, aligned with the full-width section navigation and the outer edges of the advertising and timeline rails. Its intrinsic aspect ratio determines its height; the previous 1040px image-width and 230/200px image-height caps no longer shrink it. At the 1240px frame width, the 4000×1169 image displays at about 1240×362px.

## Invariants

- Masthead and navigation: existing centered publication frame, 1240px max.
- Article reading column: 800px max.
- Ad rail and timeline: unchanged, including bookend alignment.
- Lower Register: unchanged, independently wide.
- BREAKING, Curiosities, Special Reports, ticker, classifieds, image viewer, and share routes: untouched.
- Narrow screens: image shrinks with the publication frame, maintaining aspect ratio.

## Install

Extract the ZIP at the website repository root, replacing `index.html`. No SNIPE change and no image asset replacement required.

## Validation

- Source diff reviewed against the Rev47 overlay.
- ZIP integrity checked.
- Browser render: see accompanying validation status; not assumed from source checks.
