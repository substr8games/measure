# The Measure Rev23 — Published Gallery Reader

Overlay `index.html` at **The Measure website repository root** and deploy it. This is based on the Rev18 site with the adjusted adult-content warning/placard and page-break marker compatibility intact.

The site now recognizes `type: "gallery"` records in the canonical `manifest.json`, displays galleries in the publication directory, section listings, search, and Lower Register, and supports shareable gallery pages at `#/gallery/<gallery-id>`.

Click a gallery image for the existing large viewer, previous/next buttons, keyboard arrow navigation, and thumbnail navigation. If a gallery has an advertiser/sponsor that matches existing ads, clicking one of those ads opens the published gallery; otherwise the previous automatically grouped advertiser-gallery behavior is retained.

The site does not need a server, a build framework, or additional credentials. The companion SNIPE Rev23 overlay is required to create and publish collections.
