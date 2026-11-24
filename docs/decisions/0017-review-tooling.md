# 0017: Review skeletons by drawing them back over their fonts

- **Date:** 24 November 2026
- **Status:** accepted

## Context

Every glyph in Noto Sans Cuneiform is getting a new skeleton, traced by a script and reviewed by a person. There are more than a thousand, so the review needs tools: a way to see each skeleton over its glyph, a score that points to the ones worth a closer look, and a check in CI that a later edit doesn't break one. The same tools will serve other fonts later.

## Decision

- **The redraw check runs in the repo**, in `src/review/redraw/`, both in a Vitest data test and in a development-only review page, so that the two always agree.
- **Fonts are read with [opentype.js](https://github.com/opentypejs/opentype.js)** (MIT), which runs in Node and in the browser alike, and drawn on an `OffscreenCanvas`. Node has no canvas, so tests provide one from [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) (MIT), the same API on Skia, which is what Chrome draws with. Scores in the two agree to about 0.01. We considered a rasterizer of our own, which gives identical scores everywhere, but it's more code to maintain than a development dependency.
- **`src/review` is a layer of its own**, for development only. It may use anything, and nothing imports it, so none of it reaches the app.
- **Each font's stroke style lives beside the check**, not in the skeleton files, which describe where strokes are, not how thick a font draws them.
- **New skeletons build up in `data/skeletons/noto-next.json`**, which the app doesn't load, so batches can land on `main` without changing recognition, and one final change swaps the file in.

## Consequences

The data test reads the font and checks every sign on every run of `npm run check`, which adds about three seconds for each thousand signs.

## Revisit when

A font draws strokes in a way the stroke style can't describe, such as headed wedges: add a style for it.
