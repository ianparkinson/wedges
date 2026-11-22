# 0016: Skeletons describe glyphs in the font's frame

- **Date:** 22 November 2026
- **Status:** accepted

## Context

The first skeleton format recorded each sign as the points a person's finger would follow: each wedge's two ends and each Winkelhaken's vertex and leg ends, on a 0–10 grid with y pointing down, fitted to each sign's own box. It was a sample of a trace, not a description of the glyph, so a skeleton was hard to check against its font, and it held nothing about a wedge's head that the matcher could use.

Before choosing a new format, we measured glyphs in the fonts that Wedges might use: Noto Sans Cuneiform; the Oracc fonts CuneiformOB, CuneiformComposite, and CuneiformNA; Sinacherib; and Sylvie Vanséveren's Assurbanipal, Esagil, Santakku, SantakkuM, and UllikummiA. A fitting script, kept outside the repo, fitted wedges and Winkelhaken to each font's rendered glyphs. It found the following:

- Wedge heads have a nearly constant aspect, depth divided by width, within each font: about 0.84 in CuneiformNA, 0.80 in Sinacherib, 0.86 in CuneiformOB, and 0.6–0.7 in the Vanséveren fonts. Noto's wedges taper over their whole length, with no distinct head.
- In the Vanséveren fonts, a head's back edge leans from square to the tail by a roughly constant angle within each font, about −3° to −8°. Elsewhere it's square.
- Tails are straight, and often exactly horizontal or vertical.
- Winkelhaken have legs of equal length when measured along their centre lines, even in the Vanséveren fonts, whose Winkelhaken look lopsided from the outside. The angle between the legs is nearly constant within a font, from about 70° to 105° depending on the font.
- In fonts built from separate wedges, a head's point is about 60–65°, unlike a Winkelhaken. In the Vanséveren fonts, the two look very alike.
- Fonts often build a sign from different strokes, so skeletons can't be converted from one font to another.
- Cuneiform fonts rarely give a usable cap height: the Oracc fonts and Sinacherib report −1 or 0.
- No font has alternate glyphs for one code point. CuneiformNA has a few ligatures, and private-use variants. Assurbanipal, Esagil, and UllikummiA have private-use glyphs, mostly groups of signs. Glyph names are optional, and most of these fonts name each glyph only after its code point.

## Decision

- **Shapes describe the glyph.** A wedge is its start, direction, length, and head size (`w x y dir length head`). A Winkelhaken is its vertex, opening direction, and leg length (`k x y dir leg`). Head aspect, head lean, and the Winkelhaken angle are per-font values, not per-shape values.
- **The frame is the font's own, with 1 em = 100**, the baseline at y = 0 and y pointing up, so that a skeleton lines up with its rendered glyph with no measuring. The em is used because there's no reliable cap height.
- **The Winkelhaken vertex is where the legs' centre lines meet**, inside the elbow, so that equal legs fit every font measured.
- **A headless line is a wedge with head size 0**, and starts at its top end if vertical, else its left end.
- **One file per font, named after it**, with the font's name, version, and units per em, and any credit its licence asks for.
- **An entry's `text` can be a ligature or a private-use code point**, so that a file can describe every cuneiform glyph in a font. An entry can have no shapes, with a comment saying why.
- **Entries and shapes are in a fixed order**, so that a tool rewriting a file produces a small diff.
- **The matcher's behaviour doesn't change.** It reads each shape as the same kind of stroke as before, and doesn't yet use head sizes.
- **The Noto skeletons were converted** from the first format: each was scaled, keeping its proportions, to fit its glyph's ink, and given a synthetic head size of 15. Its `winkelhakenAngle` is 70°, the angle that the hand tracing used, not the font's (about 100°), so that recognition doesn't change.

## Revisit when

The matcher starts to use head sizes, for example to match headless lines drawn either way round, or to tell a Winkelhaken from a wedge head with little tail; skeletons are traced again from Noto's glyphs, when the Winkelhaken angle can follow the font; or a font needs a shape that the format can't describe, such as a curved stroke.
