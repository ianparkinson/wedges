# 0010: Generic helpers in `src/lib`, apart from `core`

- **Date:** 10 November 2026
- **Status:** accepted

## Context

`src/core` held a few helpers that know nothing of cuneiform: points and angles in `geometry.ts`, `groupBy` in `collections.ts`, and `clamp`, which sat in `geometry.ts` though it isn't geometry. Features used them too, so those imports read as reaching into the recognition code for a utility, and someone looking for a helper had to pick them out from among the domain modules.

## Decision

Generic helpers live in `src/lib`: `geometry.ts`, `collections.ts` and `numbers.ts`, each with its tests. `lib` imports nothing of ours and, like `core`, has no React or DOM; `tsconfig.core.json` covers both, and ESLint keeps `lib` from importing the other layers. Any layer may import `lib`, including `ui`.

The name follows the usual meaning of `src/lib` in Vite and React projects. `utils` tends to become a junk drawer, and `shared` says who uses the code rather than what it is.

## Consequences

`core` now depends on `lib`, so if `core` moves into a workspace package ([0004](0004-layers.md)), `lib` goes with it, as part of that package or as one of its own. The accuracy benchmark runs on changes to `src/lib`, since matching uses its geometry.

## Revisit when

A helper in `lib` turns out to need something from `core`: it belongs in `core` instead.
