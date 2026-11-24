# Review tooling

Skeletons are traced over a font's glyphs, so the way to check one is to draw it back and lay it over the glyph. This document describes the tools that do that.

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
