# THE MEASURE — REV46 / BREAKING WIRE SHUFFLE

## Rule

Select the 15 newest eligible BREAKING records by publication date, then randomize the **display order** for each ticker cycle.

## Behavior

- On initial load, the 15 newest BREAKING entries are shuffled.
- At the end of a full scrolling loop, a fresh shuffle is rendered, preserving the 15-entry selection.
- Consecutive cycles with two or more items may not repeat the identical order; a one-position rotation is used if the shuffle happens to reproduce it.
- Every three minutes, the source catalogs are refreshed. If the underlying story pool is unchanged, the current scrolling cycle is not interrupted.
- If the pool changes, the new 15 most recent items are loaded and shuffled.
- Phi Labs copy lines continue shuffling between stories.
- On article pages the ticker remains hidden, with no reserved footer space. The Lower Register is never covered.

## Installation

Extract the ZIP at the website repository root, replacing `index.html`. This is based on The Measure Rev44 and does not change SNIPE or the existing JSON catalogs.
