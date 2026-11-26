# Review tooling

Skeletons are traced over a font's glyphs, so the way to check one is to draw it back and lay it over the glyph. This document describes the tools that do that: the redraw check, which scores a skeleton, and the review page, where you look through a file's skeletons.

## Redraw check

The redraw check draws a skeleton in its font's own style and compares it with the font's glyph, pixel by pixel. The code is in `src/review/redraw/`.

1. Read the glyph's outline from the font file in `data/fonts/`, at 1 em = 100, the skeleton's frame.
1. Draw each shape as the font draws its strokes. Skeleton files don't record stroke widths, so `src/review/redraw/fonts.ts` gives each font a _stroke style_: in a tapered font such as Noto, a wedge narrows from its head to a flat tail end, and each leg of a Winkelhaken narrows from the vertex to its tip.
1. Draw the glyph and the shapes on a canvas, two pixels to the unit, and count the pixels where they agree. A pixel counts as covered when it's at least half filled.

The check gives three scores for each sign, and one for each shape, all from 0 to 1:

| Score    | Meaning                                                                                      |
| -------- | -------------------------------------------------------------------------------------------- |
| Overlap  | The area both cover, divided by the area either covers. 1 is a perfect fit.                  |
| Missed   | The fraction of the glyph's ink that no shape covers: a stroke missing, or too short.        |
| Outside  | The fraction of the drawn shapes that lies outside the ink: a stroke too long, or misplaced. |
| By shape | The fraction of each shape that lies outside the ink, which picks out the stroke at fault.   |

A good skeleton doesn't reach an overlap of 1, because a font's strokes don't follow the stroke style exactly. A good Noto skeleton scores about 0.85–0.95.

### Data test

`test/data/redraw.test.ts` runs the check on every sign in the skeleton files that have limits in `src/review/redraw/limits.ts`, and fails with the sign's characters and code points when one falls outside them: an overlap too low, or a shape too far outside the ink. The limits catch a stroke that is missing or in the wrong place, not one slightly off.

## Review page

The review page shows every glyph in a skeleton file's font, with its skeleton drawn over it. It's for development only: the production build leaves it out, and only the development server can read files from git history for it (`scripts/review/vitePlugin.ts`).

To open it, run `npm run dev` and go to http://localhost:5173/wedges/review.html.

- **File.** Choose a skeleton file from `data/skeletons/`. The page opens `noto-next.json` by default.
- **Tiles.** Each tile shows the glyph in grey with the skeleton's shapes over it, the sign's OSL name, and its overlap score. A shape outside the data test's limit is red. Glyphs with no skeleton have tiles too, so you can see what's left to trace. The page scores the signs a few at a time after it opens, so the scores, and any sort or filter by them, fill in over the first few seconds.
- **Filters.** Show one group of signs by OSL name (simple, modified, compound, or not in OSL), one Unicode block, or one status: traced, untraced, reviewed, unreviewed, or failing the data test.
- **Sort.** In file order, by overlap with the worst first, or by each sign's worst shape.
- **Detail.** Select a tile to see it larger, with each shape numbered at its start and listed with how much of it lies outside the ink. Clear **Glyph** or **Skeleton**, or press G or S, to hide either.
- **Reviewed marks.** Select **Reviewed**, or press R, to mark a sign and move on to the next. The mark records the sign's shapes, so editing the skeleton clears it. Marks are kept in your browser's local storage, not in the repo.
- **Mark shown.** Select **Mark shown reviewed** or **Mark shown unreviewed** to mark or unmark every traced sign the filters show, including tiles not yet drawn. Each asks you to confirm with a second button, which says how many signs it will change.
- **Keys.** With a sign open, press the Left and Right arrow keys to move through the signs shown, G or S to hide or show the glyph or the skeleton, and Esc to close it.
- **Compare.** Choose a skeleton file under **Compare with**, and optionally a git ref, such as `main` or `HEAD~1`, under **At ref**. With no ref, the page compares with the file as it is now, for example `noto.json` against `noto-next.json`. At a ref, it reads the font from that ref too. A sign has changed when its shapes differ or its font draws its glyph differently, and the **changed** status shows only those. Their tiles draw the earlier shapes, and any earlier glyph outline, dashed, and the detail shows the earlier version below the current one, with new and removed shapes marked.

The page keeps its choices in its URL, and updates as soon as you save a skeleton file, so you can edit the JSON beside it and see the result. After editing, run `npm run sort-skeletons` to put the files' entries and shapes back in order.

## Trying skeletons in the app

The accuracy benchmark draws its test signs from the skeletons it tests, so it can't show whether new skeletons match what people draw. To try them by hand, open the app in development with the skeleton file named in the URL, such as http://localhost:5173/wedges/?skeletons=noto-next, or follow **Draw with these skeletons** on the review page. The app then matches against that file instead of `noto.json`. The production build ignores the parameter.
