# THE MEASURE — Rev54 Section Taxonomy

**Source baseline:** `THE-MEASURE-Rev53-WIRE-Modal-overlay(3).zip`.

## Navigation

- Remove Science as an editorial section.
- Rename Humanities to Structuralism (`structuralism`).
- Remove Play (the former Games section) from navigation and section pages.
- Keep THE WIRE as a direct navigation control, launching the unchanged Rev53 modal.
- Preserve Breaking, Technology, Politics, Curiosities, Classifieds, and Special Reports.
- Retain historical `#/section/science` and `#/section/humanities` aliases, both now resolving to Structuralism.
- Keep the historic `humor` → Curiosities alias.

## Install

Extract this overlay into the publication repository root. It replaces `index.html` and adds `scripts/retag-structuralism.sh`. All Rev53 Wire assets remain in place and must not be removed.

## Migrate already published classifications

Where `manifest.json` and the `articles/` directory are present in the publication root, run:

```bash
bash scripts/retag-structuralism.sh
```

The script migrates **only section classifications** from `science` and `humanities` to `structuralism` in `manifest.json` and any JSON records found in `articles/`, `galleries/`, and `series/`. It preserves section order, eliminates duplicates, and updates top-level `category` only when it is exactly `Science` or `Humanities`. Body text and freeform topic tags are left alone. It needs Bash and `jq`, validates all targeted JSON before editing, and is safe to rerun. Inspect the changed files and include them in the same deployment as `index.html`.

As of the live publication-index check on November 8, 2026, **16 manifest entries** used at least one of the old section IDs. The front end displays these entries under Structuralism even before the JSON migration is deployed.

If HTML SEO editions have already been generated, rebuild those pages and the sitemap in the current SNIPE workflow after migrating, so their static metadata matches the new taxonomy.

This overlay does **not** overwrite SNIPE. Its current publisher build was not included with the Rev53 website upload. The editor's section selector must be updated separately before publishing new Structuralism articles.

## Validation

Checked the original Rev53 structure and the modified section declarations/nav code. The Bash/jq migration passed a synthetic publication test covering merged sections, intact tags/content, series, and idempotence. ZIP integrity checked. A live Chromium render was not available; browser execution must be checked on the target system.

All Rights Reserved.
