# The Measure — Rev44 / Share Cards and Article Links

## Installed paths

- `index.html` — article sharing strip and branded home metadata
- `images/social-card.png` — fallback 1200×630 Open Graph preview
- `read/oracle-*/index.html` — six static, crawlable Oracle dispatch editions

## Share behavior

- The COPY LINK action for SNIPE-published articles produces the corresponding `read/<slug>/` URL, whose HTML is emitted by SNIPE during publication. This is a real HTML page with metadata, not a hash route.
- Seed Oracle dispatches share their included static editions under `read/oracle-*/`.
- Visual commentary and other non-article records retain hash links; the website home Open Graph cover provides the generic fallback.
- The interactive reader remains at `#/article/<slug>` and the static edition links back to it.
- Social sharing offers Copy, Bluesky, Reddit, X and native Web Share when supported.

## Dependencies

For old SNIPE articles, run the existing **Rebuild Static HTML** operation in SNIPE so all `read/<slug>/index.html` pages have the new metadata. Publishing a new article with the Rev44 SNIPE overlay also emits its static edition.

Server/crawler tests cannot be completed until the pages are deployed to the production GitHub Pages site. Link-preview caches may need refreshing after deployment.
