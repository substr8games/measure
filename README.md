# The Measure Rev26 — SEO public-site shell

Overlay root: The Measure website GitHub Pages repository root. Replace only `index.html`.

- Adds a homepage canonical link and Open Graph metadata.
- Adds a sitemap discovery link pointing to `sitemap.xml`.
- Links to the real `read/` static article archive in the site footer.
- Adds a usable no-JavaScript link to the public article archive.
- Preserves the Rev25 ad/gallery routing, styling, galleries and content warning.

The physical `read/` HTML pages and `sitemap.xml` are created by SNIPE's **Build SEO pages + sitemap** command. Run it after installing the SNIPE overlay, then deploy this website overlay.

The website remains under its existing host and project path; no reverse proxy or server rewrite is needed.
