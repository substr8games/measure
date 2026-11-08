# THE WIRE — Rev54.2: Final Progress Counter Synchronization

## Installation

This overlay is relative to The Measure repository root. It replaces only:

- `games/wire/wire.js`

It is based on **THE-MEASURE-Rev54.1-WIRE-Persistent-Handles-overlay**. Keep the Rev54.1 `wire.html`, `wire.css`, `resources/strings.json`, and companion Cloudflare Worker in place. No Worker update, database migration, build step, or new dependency is required.

## Change

The final Worker-confirmed connection enters `finish()` and returns before the ordinary post-selection footer update. The header already reflects the final `5 / 5`, but the board footer can remain at `4 / 5`.

Rev54.2 writes the final session's `state.progress` to the board footer during finalization. The header and footer therefore both display `5 / 5 VERIFIED CONNECTIONS` after the fifth confirmed connection, including when a completed run is restored.

No game rules, ranked-session behavior, persistent investigator handles, leaderboard behavior, or score calculations are changed. The **INSTITUTIONAL OUTRAGE** meter and its **INSTITUTIONAL PANIC** threshold label remain distinct and unchanged.

## Smoke checks

1. Complete a ranked investigation. Confirm the header reads `05 / 05` and the board footer reads `5 / 5 VERIFIED CONNECTIONS`.
2. Close and reopen a completed investigation. Confirm both counters remain at `5 / 5`.
3. Complete an unranked practice investigation. Confirm the footer also reaches `5 / 5`.
4. Confirm the saved investigator handle and REROLL behavior from Rev54.1 remain intact.
