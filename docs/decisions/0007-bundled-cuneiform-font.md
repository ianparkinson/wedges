# 0007: Bundle Noto Sans Cuneiform

- **Date:** 7 November 2026
- **Status:** accepted

## Context

Candidates, picked signs and later lookup results show cuneiform characters. Android ships Noto Sans Cuneiform, but iOS and many desktops have no cuneiform font at all, so the characters would show as empty boxes there.

## Decision

Bundle Noto Sans Cuneiform from the `@fontsource/noto-sans-cuneiform` package (SIL Open Font License 1.1), and import only its cuneiform subset. Its `@font-face` rule has a `unicode-range` covering the cuneiform blocks, so the browser fetches the font (about 470 kB as WOFF2) only when a cuneiform character is on the page, and draws text in the system font meanwhile (`font-display: swap`). The skeletons were traced over the same font, so a candidate looks like what was drawn.

## Revisit when

The font's size shows up as a slow first draw on a phone, in which case it could be subset to the signs the app can show, or other script styles arrive and the user can choose between fonts.
