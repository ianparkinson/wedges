# 0003: Sign data as versioned JSON, not code

- **Date:** 3 November 2026
- **Status:** accepted (implemented in milestone 2)

## Context

The app needs two kinds of data: the sign templates the matcher compares drawings against, and names, values and ids from the Oracc Sign List. Shipping them as JavaScript modules would mix data with code, and they couldn't be validated.

## Decision

- Templates live in `data/templates/noto.json`, one entry per sample: `{ char, spec, style, source }`. The `style` and `source` fields are there now so later fonts and tidied traces need no format change. The data format leaves room for several samples per sign.
- Oracc Sign List data lives in `data/osl.json`, generated from `osl.asl` by `scripts/build-osl.ts`, including compound parts, variants and sequences. It is never edited by hand.
- Both files have JSON Schemas in `data/schemas/`, and are validated in a unit test, not at runtime.
- Spec strings use a compact text notation with two ops, one per stroke shape.
- The data loads lazily, after first paint.

## Revisit when

The data grows large enough that a binary or split format would load noticeably faster.
