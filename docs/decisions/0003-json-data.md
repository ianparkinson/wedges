# 0003: Sign data as versioned JSON, not code

- **Date:** 3 November 2026
- **Status:** accepted (implemented in milestone 2)

## Context

The prototype keeps its 832 templates in `signs.js` and its Oracc Sign List data in `sign-info.js`, as JavaScript. That mixes data with code and can't be validated.

## Decision

- Templates live in `data/templates/noto.json`, one entry per sample: `{ char, spec, style, source }`. The `style` and `source` fields are there now so later fonts and tidied traces need no format change. The data format leaves room for several samples per sign.
- Oracc Sign List data lives in `data/osl.json`, generated from `osl.asl` by `scripts/build-osl.ts`, including compound parts, variants and sequences. It is never edited by hand.
- Both files have JSON Schemas in `data/schemas/`, and are validated in a unit test, not at runtime.
- Spec strings stay in the prototype's compact notation ([sample-format.md](../sample-format.md)), reduced to two ops (one per stroke shape) while converting.
- The data loads lazily, after first paint.

## Revisit when

The data grows large enough that a binary or split format would load noticeably faster.
