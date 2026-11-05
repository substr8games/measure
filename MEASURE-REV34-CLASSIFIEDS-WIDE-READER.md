# The Measure / Rev34 — Classifieds wide reader

Changes in `index.html` only.

- Fixed a route-specific width calculation that subtracted 320px from the already constrained 800px article grid track, leaving the classifieds reader only about 480px wide on desktop.
- On the classifieds route, the main content area now spans into the otherwise unused right grid track, up to 1100px wide, without changing the publication masthead or article layouts.
- The newsgroup index uses a 30%/70% split, with a 260px minimum at desktop sizes.
- Under 760px, the category index and posting pane stack vertically.
- Existing left advertisement, image viewer, navigation, fictional discussions, and signup notice remain unchanged.

Install at the website repository root, replacing `index.html` from Rev33. No SNIPE changes.
