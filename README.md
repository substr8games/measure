# THE MEASURE — Website v5.2

This is a complete, browser-native, static GitHub Pages website. **No build step, Node, Cloudflare Worker, or content database.**

## Files

- `index.html`: publication website (HTML, CSS and JavaScript are self-contained).
- `manifest.json`: canonical catalog, **do not overwrite if already populated**.
- `images/`: logo, placeholders, and files published by SNIPE.
- `articles/`: per-article JSON files and longform PDF editions published by SNIPE.

## Deployment

Upload the extracted contents directly into the root of your existing GitHub Pages publication repository. Under GitHub **Settings → Pages**, publish the branch root. A custom domain is optional. Set your domain in Pages settings after purchasing it. GitHub manages its `CNAME` when using branch publishing; do not add an invented domain.

The JSON catalog starts empty and the site displays its opening editorial splash until you publish via SNIPE 0.3.2. It fetches `manifest.json` at runtime and displays individual `articles/*.json` on demand. Images and PDFs use relative links, so a future custom domain requires no data migration.

## Navigation and classification

Seven sections: Science, Technology, Humanities, Politics, Thinkpieces, Humor and **Special Reports** (red accent). The article directory is on the right, supports text and thumbnail links, and filters by section. PDFs with `sections: ["science", "special-reports"]` appear in both sections, with a single canonical item. A bottom horizontal Lower Register displays image uploads and PDFs; tags `ad`, `advert`, `parody-ad` or `sponsored` cause satirical-ad presentation.

## Content schema

Manifest: `phi-labs.publication-manifest.v1`. Article: `phi-labs.article.v1`, with `markdown` as canonical source, optional simplified `blocks`, and metadata. Media: `phi-labs.media.v1` stored as catalog records, with files under `images/media/` and PDFs under `articles/`. HTML is escaped; Markdown supports headings, lists, quotes, tables, code blocks, links, images and basic inline formatting.

**No uploaded articles or memes are included in the starter manifest.** No remote publishing was performed. Keep SNIPE itself private; the publication repo should contain only the public reader, its content and public assets.

## Editorial grids (v5.2)

The Measure v5.2 renders SNIPE 0.3.2's `{[| ... |] ... [| ... |]}` editorial grid syntax. Any number of rows and columns can be authored without custom article JSON fields. Columns and rows are separated by the author's line-leading `|` and `[|` row markers, respectively; `|]` ends a row, and `|]}` ends the whole grid.

```text
{[| **First**
| ![Image](images/articles/example/photo.webp)
| [Source](https://example.org) |]
[| Second row left
| Second row middle
| Second row right |]}
```

Each cell renders ordinary Markdown. Wide grids scroll horizontally on desktop, and cells stack vertically within each row on narrow screens. This does not change the article schema or the site catalog. Legacy blank-header, two-column Markdown tables continue to render as earlier editions.
