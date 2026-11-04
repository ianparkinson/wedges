# Skeleton format

A **skeleton** is a sign's strokes as a font draws them, with no stroke weight: where each wedge starts and ends, and where each Winkelhaken's vertex and legs are, in a standard frame. The skeletons in `data/skeletons/` are written in a compact text form called the **spec** notation. This document defines that notation and the files that hold the skeletons.

## Coordinate frame

- Coordinates are on a **0–10 grid**, x to the right and **y downward** (as on screen).
- A sign is usually placed so that the longer side of the bounding box of its key points (wedge ends, Winkelhaken vertices and leg ends) runs from 0 to 10, and the shorter side is centred around 5. For example, a sign twice as wide as it is tall spans x 0–10 and y 2.5–7.5.
- Only relative positions matter: the matcher normalises every skeleton again when it loads it ([matching.md](matching.md)), so a skeleton may use any placement within the grid.
- Two decimal places are plenty. Most coordinates have one, which is 1% of the sign's size.

## Spec notation

A spec is a list of strokes separated by semicolons. Each stroke is an op followed by numbers, separated by spaces:

```
spec   = stroke *( ";" [space] stroke )
stroke = op 1*( space number )
number = decimal, optionally negative, e.g. 3 | 0.5 | 10 | -0.2
```

Whitespace around semicolons is ignored. Empty items are skipped.

| Op  | Stroke      | Arguments         | Meaning                                                                                         |
| --- | ----------- | ----------------- | ----------------------------------------------------------------------------------------------- |
| `w` | wedge       | x1 y1 x2 y2       | head (the wide end, where the finger lands) at (x1, y1), tail at (x2, y2)                       |
| `h` | Winkelhaken | vx vy ax ay bx by | vertex (the point of the angle) at (vx, vy), and the ends of its two legs at (ax, ay), (bx, by) |

These two ops write out exactly the points that matching uses ([stroke-recognition.md](stroke-recognition.md#output)), so there is nothing to convert.

### Example

AN: a vertical, a horizontal, and two diagonals crossing at the centre.

```
w 5.1 0.1 5.1 10; w 0 4.7 10 4.7; w 1.4 1.1 8.7 8.1; w 1.4 8 8.8 0.9
```

### Parsing

`parseSpec()` in [`src/core/spec.ts`](../src/core/spec.ts) turns a spec into strokes; it throws on an unknown op or the wrong count of numbers.

### History

During early prototyping the notation had different ops, including shorthand for horizontal, vertical and diagonal wedges given by a head and a length, and for a Winkelhaken opening to the right with legs at 0.7 × its size. Those Winkelhaken leg ends are why some coordinates have two decimal places.

## Skeleton files

`data/skeletons/noto.json` holds the 832 skeletons traced by hand over Noto Sans Cuneiform in October 2026. There is one file per script style or font. Their schema is `data/schemas/skeletons.schema.json`, and `test/data/skeletons.test.ts` checks every file in `data/skeletons/` against it.

```json
{
  "version": 1,
  "style": "noto",
  "comments": "Traced by hand over Noto Sans Cuneiform during prototyping, October 2026.",
  "skeletons": [
    {
      "char": "𒀭",
      "spec": "w 5.1 0.1 5.1 10; …"
    }
  ]
}
```

| Field                  | Meaning                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `style`                | the script style or font the file follows; `noto` for now                            |
| `comments`             | optional notes on the file: who or what made it, and when                            |
| `skeletons[].char`     | the Unicode character, a single code point in the cuneiform blocks (U+12000–U+1254F) |
| `skeletons[].spec`     | the strokes, in spec notation                                                        |
| `skeletons[].comments` | optional notes on one entry                                                          |

The file is formatted by Prettier, like the rest of the repo. It has one skeleton per character for now, but a file may have several for a character, for example for variant forms.

Names, values and links for each character come from the Oracc Sign List data, not from the skeletons.

## Ideas for later

- **Script styles:** skeletons in another style or font, such as Neo-Assyrian, would go in their own file with their own `style`, so they can be told apart, filtered and credited.
- **Snapping:** when the skeletons were first traced, wedges within 8° of horizontal or vertical were snapped straight, and Winkelhaken opening within 30° of rightwards were made symmetrical. A tool for making skeletons could snap in the same way, so that skeletons are always tidy, and the matcher could snap drawn strokes to match. The accuracy benchmark can tell whether snapping drawn strokes helps.
