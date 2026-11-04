# THE MEASURE — Rev32 / Image Viewer and Width Limits

[PROJECT: THE MEASURE]
[REVISION: 32]
[DATE: 2026-11-04]
[DELIVERY: REPOSITORY-ROOT OVERLAY]

## Changes

- Standalone visual commentary and gallery imagery is fitted to at most 1080 CSS pixels across and constrained by the viewport. The old 480px poster restriction is removed. Captions appear beneath, rather than beside, the artwork.
- Inline article images are limited to 720 CSS pixels across. Classified posting images are limited to 520 CSS pixels across. Both retain their aspect ratios and fit smaller screens.
- Images in articles, classifieds, lower-register thumbnails, sidebar advertisements, and editorial cover thumbnails open a shared full-screen image inspector when clicked. Non-image portions of navigation cards retain their existing links.
- Gallery tiles retain gallery navigation, but their enlarged image dialog now supports a full-size button.
- Full-screen inspector controls: FIT (maximum 1080 CSS pixels and height-constrained), 100% (native pixel size in scrollable viewport), OPEN ORIGINAL (same-origin asset in new tab), and CLOSE. Clicking the enlarged image toggles fit/native size. Native Escape closes the dialog.
- The logo and content-warning artwork retain their original navigational and admission behavior.
- No SNIPE changes, additional dependencies, user-upload endpoints, or source/data migrations.

## Installation

Extract this overlay at the website repository root, replacing `index.html`. Do not nest an additional revision directory.

## Verification

- Static structure checks and ZIP integrity checks performed.
- Headless Chromium could not finish initialization in the container; interaction should be visually checked in a normal browser.
