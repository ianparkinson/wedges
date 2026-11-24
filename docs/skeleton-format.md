# Skeleton format

A _skeleton_ describes the strokes of one sign as a particular font draws it: where each wedge starts, which way it points, and how long it is, and where each Winkelhaken's vertex is and which way it opens. The matcher compares a user's drawing with these skeletons. This document defines the skeleton files in `data/skeletons/` and the shapes they contain.

Skeleton files describe the glyphs themselves, not a sample of someone drawing them, so that you can check a skeleton against its font and review or edit a file by hand.

## Shapes in a font

The format assumes that a font draws cuneiform from two kinds of shape.

A _wedge_ has a triangular _head_ and a straight _tail_:

- The head's _aspect_, its depth divided by the width of its back edge, is roughly constant throughout a font.
- In some fonts, the head's back edge isn't square to the tail, but leans by a roughly constant angle.
- Some fonts have no distinct head: their wedges taper over their whole length. These fonts are called _tapered_; the others are _headed_.
- A wedge can be a bare head, with no tail.
- A _headless line_ is a straight line with no head, which some glyphs contain.

A _Winkelhaken_ is a chevron: two legs of equal length that meet at a vertex. The angle between the legs is roughly constant throughout a font, but differs from one font to another.

A Winkelhaken can look like a wedge head with no tail. In fonts built from separate wedges, the two have quite different angles, but in some fonts they look alike.

Fonts often draw a sign with different strokes, so each font needs its own skeletons. You can't derive them from another font's skeletons.

The format doesn't cover curved strokes, which a few signs have.

## Coordinate frame

Coordinates are in the font's own frame, scaled so that 1 em is 100 units:

- The origin (0, 0) is on the baseline, at the glyph's origin: the left of its advance, as the font defines it.
- The x axis points right, and the y axis points up. Parts of a glyph below the baseline have negative y.
- Positions and lengths are normally whole numbers, a step of 1% of the em. Use decimals only where whole numbers aren't precise enough.
- Angles are in degrees, at least 0 and less than 360, measured anticlockwise from the positive x axis: 0 points right, and 90 points up. They're normally whole numbers, but can have decimals where necessary.
- A skeleton isn't limited to a box: it can extend outside 0–100 in either direction.

Because skeletons are in the font's frame, a glyph rendered at a font size of 1 em lines up with its skeleton drawn at 100 units to the em.

## Shape strings

Each shape is a string: an op, then its numbers, separated by single spaces.

### Wedge

```
w x y dir length head
```

| Value    | Meaning                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------- |
| `x y`    | The start: the midpoint of the head's back edge, the edge furthest from the tail.               |
| `dir`    | The direction from the start towards the end of the tail.                                       |
| `length` | The distance from the start to the end of the tail, including the head.                         |
| `head`   | The head size: the width of its back edge. Leave out any flare at the extreme tips of the edge. |

The file's per-font values describe the rest of the wedge:

- In a headed font, the head's depth is `headAspect × head`. A wedge whose `length` equals its head depth is a bare head. A `length` less than the head depth isn't valid.
- In a tapered font, the wedge narrows from `head` at the start to a point at the end of the tail.
- The head's back edge runs at `dir + 90 + headLean` degrees.

### Headless line

A headless line is a wedge with a `head` of 0:

```
w x y dir length 0
```

Either end could be the start, so the format fixes which one to use, following the direction that wedges most often run:

- For a vertical line, the start is the top end, the one with the larger y. So `dir` is 270.
- For any other line, the start is the left end, the one with the smaller x.

### Winkelhaken

```
k x y dir leg [angle]
```

| Value   | Meaning                                                                                                   |
| ------- | --------------------------------------------------------------------------------------------------------- |
| `x y`   | The vertex: where the centre lines of the two legs meet, inside the elbow.                                |
| `dir`   | The opening direction, from the vertex towards the open side, halfway between the legs. A `<` opens at 0. |
| `leg`   | The length of each leg, along its centre line from the vertex to its tip.                                 |
| `angle` | Optional. The angle between the legs, for a Winkelhaken that differs from the file's `winkelhakenAngle`.  |

The legs' tips are at `dir ± angle / 2`. Without `angle`, they're at `dir ± winkelhakenAngle / 2`, where `winkelhakenAngle` is the file's per-font value.

Measuring a Winkelhaken along its centre lines, rather than from its outer point, means that equal legs fit even where a font's Winkelhaken look lopsided from the outside.

Give `angle` rarely: only where a glyph's Winkelhaken opens noticeably wider or narrower than the font's usual angle, by more than about 8°. Small differences are within the variation between one Winkelhaken and the next, and recording them makes the file harder to review.

### Examples

AN: a horizontal wedge, two diagonal wedges, and a vertical wedge, all the same length and crossing at the centre:

```json
["w 13 33 0 78 15", "w 24 5 45 78 15", "w 24 61 315 78 15", "w 52 72 270 78 15"]
```

IGI: a Winkelhaken opening to the right, then a vertical wedge, and a short horizontal wedge to its right:

```json
["k 18 31 0 31", "w 50 70 270 77 15", "w 60 32 0 37 15"]
```

## Skeleton files

There's one file for each font, named after it, such as `data/skeletons/noto.json`. The file name is the font's id in the app. Each file is formatted by Prettier, like the rest of the repo.

While a font's skeletons are being replaced, the new ones build up in a second file, such as `data/skeletons/noto-next.json`, which the app doesn't load. See [Review tooling](review-tooling.md).

```json
{
  "version": 2,
  "font": {
    "family": "Example Cuneiform",
    "version": "1.000",
    "unitsPerEm": 1000,
    "sha256": "4c5e1f0a9b2d3e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f"
  },
  "credit": "Font by A. N. Author",
  "comments": "Traced over Example Cuneiform 1.000.",
  "wedges": "headed",
  "headAspect": 0.84,
  "headLean": 0,
  "winkelhakenAngle": 100,
  "skeletons": [
    { "text": "𒀸", "shapes": ["w 3 34 0 70 30"] },
    { "text": "𒌋", "shapes": ["k 10 35 0 29"] },
    { "text": "𒋰", "shapes": ["w 3 26 0 70 28", "w 4 45 0 69 30"] },
    {
      "text": "𒊹",
      "comments": "Curved in this font, which the format can't describe."
    }
  ]
}
```

| Field                  | Meaning                                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `version`              | Always 2.                                                                                                                              |
| `font`                 | The font the skeletons were traced over: its family name, version, units per em, and the font file's SHA-256 hash. See [Font](#font).  |
| `credit`               | Optional. The attribution that the app must show when it uses this file, if the font's licence asks for one.                           |
| `comments`             | Optional. Notes on the file, such as who or what made it, and when.                                                                    |
| `wedges`               | `"headed"` or `"tapered"`.                                                                                                             |
| `headAspect`           | A wedge head's depth divided by its size. Required in a headed font, and not allowed in a tapered one.                                 |
| `headLean`             | The angle of a wedge head's back edge from square to its tail, in degrees, anticlockwise. Usually 0.                                   |
| `winkelhakenAngle`     | The angle between a Winkelhaken's legs, in degrees.                                                                                    |
| `skeletons[].text`     | The characters that the font draws as this glyph. See [Text](#text).                                                                   |
| `skeletons[].shapes`   | Optional. The shapes, one string each. Leave it out for a sign that the file deliberately doesn't describe, and say why in `comments`. |
| `skeletons[].comments` | Optional. Notes on this entry. Required when there are no `shapes`.                                                                    |

The matcher uses only `winkelhakenAngle` of the per-font values. The others are for drawing skeletons and checking them against the font. The matcher uses `winkelhakenAngle`, and any Winkelhaken's own `angle`, only to place the tips of the legs when it measures a skeleton's size: it doesn't compare the angle between a drawn Winkelhaken's legs with a skeleton's. The file doesn't record stroke thicknesses: a tool that draws skeletons over a font can keep its own.

### Font

The `font` block identifies the font file that the skeletons describe. The font itself is in `data/fonts/`, unmodified, with its licence. The skeleton file doesn't name it: `src/review/redraw/fonts.ts` lists which font file each skeleton file describes. Several skeleton files can describe the same font.

A font update can move glyphs, so `sha256`, the file's SHA-256 hash in lowercase hex, pins the skeletons to one copy of the font. A data test checks that the font file has this hash. When the font changes, the test fails until you check the skeletons against the new font and update `sha256` and `version`.

`version` is the font's version as its name table gives it, such as `2.001`, for people to read. Tests don't check it.

### Text

An entry's `text` is the code point or code points that identify the glyph: one or more code points, each either in the cuneiform blocks, U+12000–U+1254F, or private-use. More than one code point is a ligature: a sequence that the font draws as a single glyph.

A font can use private-use code points, U+E000–U+F8FF or in planes 15 and 16, for variant forms or groups of signs. A private-use code point means something only in its own font. In other text, it shows as a blank box or as another font's glyph.

Where a font draws the same glyph in more than one way, such as for a ligature and for a private-use code point, the file has an entry for each. The app decides which to offer.

A file can have several entries with the same `text`, for example for variant forms. The matcher treats each one as a separate sample of the sign.

The file doesn't record glyph names. Fonts don't have to include them, and many name each glyph only after its code point.

### Order

The order of entries and shapes doesn't affect matching, but it's fixed, so that a tool rewriting a file changes only what it must:

- Entries are in order of `text`, compared one code point at a time, so a sign comes before the ligatures that start with it. Entries with the same `text` keep their order in the file. Compare code points, not UTF-16 code units: JavaScript's default string sort puts U+12000 before U+E000.
- Within an entry, shapes are in order of `x`, then `y`, smallest first, then the rest of the string, one token at a time: the op as text, and the numbers as numbers.

In JSON, write `text` as literal characters, except private-use code points: write those as `\u` escapes, as UTF-16 surrogate pairs above U+FFFF, because editors and diff tools show them as blank boxes.

### Validation

The schema is `data/schemas/skeletons.schema.json`. The tests in `test/data/skeletons.test.ts` check each file in `data/skeletons/` against it, and also check the following:

- Entries and shapes are in order.
- Every direction is at least 0 and less than 360.
- Every `length` and `leg` is greater than 0, every `head` is at least 0, and every wedge is at least as long as its head is deep.
- Every Winkelhaken's own `angle` is greater than 0 and less than 180.
- Every headless line starts at the end that this document specifies.
