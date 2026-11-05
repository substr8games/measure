# THE MEASURE — Rev49 / PLAY Section

Status: implementation overlay

## Changes

- Replace the retired Thinkpieces navigation category with **PLAY**.
- Place PLAY between Politics and Curiosities; the navigation retains cyan Breaking and red Special Reports bookends.
- Apply green `#4BEA91` to the PLAY link with a restrained 2.8-second CSS text-glow pulse and a reduced-motion static fallback.
- Provide `#/section/play` for games, puzzles, and other interactive work; the section displays its normal empty-state until content is published.
- Extend the green accent to the PLAY section heading without recoloring the publication's background.
- Keep PLAY, Breaking, and Curiosities out of homepage feature, recent-article, series-preview, and Lower Register editorial selections. The full section, archive, and all permalinks remain available.
- Preserve the existing masthead, ad and timeline rails, article width, lower register, ticker, classifieds, image viewer, and share links.
- Remove Thinkpieces from the About page's section list and the fallback homepage description.

## Installation

Extract this archive at the website repository root. It replaces only `index.html`.

This overlay does not alter `manifest.json` or any published article record. It does not deploy game functionality by itself.
