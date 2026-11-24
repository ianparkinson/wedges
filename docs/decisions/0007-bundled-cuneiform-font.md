# 0007: Bundle Noto Sans Cuneiform

- **Date:** 7 November 2026, updated 23 November 2026
- **Status:** accepted

## Context

Candidates, picked signs, and lookup results show cuneiform characters. Android ships Noto Sans Cuneiform, but iOS and many desktops have no cuneiform font at all, so the characters would show as empty boxes there.

The skeletons are traced over the same font, so a candidate looks like what was drawn. A font update can move glyphs, so the skeletons need checking against each new version of the font before the app shows it.

## Decision

Vendor Noto Sans Cuneiform's unhinted TTF, unmodified, in `data/fonts/noto/`, with its licence (SIL Open Font License 1.1), and serve that file. The `@font-face` rule in `src/app/fonts.css` uses the font for the cuneiform blocks only (`unicode-range`). On its own, that rule would make the browser wait for a cuneiform character before fetching the font, but the app shows signs as soon as someone draws, so `index.html` preloads the font with the page. Until it arrives, text is drawn in the system font (`font-display: swap`).

- **The skeletons are pinned to the font they were traced over.** Each skeleton file's `font` block gives the SHA-256 hash of the font it describes, and a data test checks the hash. The test lists which font file in `data/fonts/` each skeleton file describes, so skeleton files describe the font, not how the repo stores it, and several can share a font. A new font therefore fails the test until someone checks the skeletons against it and updates the hash.
- **Other fonts arrive the same way.** Some fonts' terms forbid distributing modified copies, so fonts are served as they are, not converted to WOFF2 or subset. The same files serve as tracing references for their skeletons.
- **A weekly workflow, `.github/workflows/check-fonts.yml`, opens an issue when a font changes upstream.** `scripts/checkFonts.sh` lists each font in `data/fonts/` with its upstream URL, such as github.com/notofonts/notofonts.github.io for Noto, and compares the two copies. When they differ, it opens an issue for that font, titled with the new version and giving both versions and hashes. If an issue for an earlier version is still open, it updates that one, so each font has at most one issue however many releases arrive. Someone then copies in the new font, checks the skeletons, and updates their hashes in one pull request.
- **It opens an issue, not a pull request** as the `osl.asl` update does ([0014](0014-update-osl.md)). A pull request with only the new font could never pass CI, because the hash test fails until the skeletons are checked, and updating the hashes automatically would skip that check. The workflow needs only its own `GITHUB_TOKEN`, since nothing it does needs to start other workflows.

The TTF is about 820 kB, or about 380 kB when the server compresses it with gzip. The WOFF2 that Fontsource builds is about 470 kB, and gzip can't shrink it further, because WOFF2 is already compressed.

## Revisit when

The font's size shows up as a slow first draw on a phone, or other script styles arrive and the user can choose between fonts.
