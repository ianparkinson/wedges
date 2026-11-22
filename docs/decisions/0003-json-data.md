# 0003: Sign data as versioned JSON, not code

- **Date:** 3 November 2026, updated 22 November 2026
- **Status:** accepted (implemented in milestone 2)

## Context

The app needs two kinds of data: the sign skeletons the matcher compares drawings against, and names, values and ids from the Oracc Sign List. Shipping them as JavaScript modules would mix data with code, and they couldn't be validated.

## Decision

- Skeletons live in `data/skeletons/`, one file per font, starting with `noto.json`. Each entry is `{ text, shapes }`, with optional `comments`; a file may have several entries for a sign. [0016](0016-skeleton-format-v2.md) describes the shapes.
- Oracc Sign List data comes from a copy of OSL's own source file, `data/osl.asl`, which is parsed at build time into names, values, compound parts, variants and sequences. Updating it means copying in a newer file, with no format of our own to maintain.
- Skeleton files have a JSON Schema in `data/schemas/`, and are validated in a unit test, not at runtime.
- Each shape is a compact string, an op and its numbers, one per wedge or Winkelhaken.
- The data loads lazily, after first paint.

## Revisit when

The data grows large enough that a binary or split format would load noticeably faster.
