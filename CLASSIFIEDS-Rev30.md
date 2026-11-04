# The Measure — Classifieds Reader — Rev30

[PROJECT: PHI LABS / THE MEASURE]
[DATE: 2026-11-04]
[STATUS: IMPLEMENTED / LOCAL REVIEW]

## Installation

Extract this overlay at **The Measure website repository root**. Replace `index.html` and add `classifieds/index.json`. Existing publication routes, section navigation, archive, right-hand timeline, ads, galleries, and article reader are retained.

## Public behavior

- `#/classifieds` opens the two-pane newsgroup/classifieds reader. `#/classifieds/<post-id>` opens a permalink to an individual listing.
- The left pane contains groups, counts, subject index and local search. The right pane shows the posting, optional illustration and parent-linked comments.
- Every listing and comment has **SIGN UP TO COMMENT**. It opens a notice that says exactly: **Our engagement metrics show you have not participated enough yet to Sign Up. Come back when you're a little ... richer.**
- Visitors can navigate and search but cannot register, submit, comment, edit, or vote. There are no public-comment endpoints.
- Catalog data is read from `classifieds/index.json`; the page fails independently of other publishing features when the optional catalog is unavailable.

## Editing

The catalog is authored exclusively from the corresponding SNIPE Classifieds workspace. The seeded file includes all five original classifieds, three character-authored listings, and the Aris / Legacy Bitch / Beta / Jade nested demonstration thread. Use SNIPE to replace the seed with subsequent curated issues. Paths in this package are relative to the repository root.
