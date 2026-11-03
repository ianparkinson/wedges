# Stroke recognition

> **Carried over from the prototype.** This document describes the algorithms in
> [cuneiforminputprototype](https://github.com/ianparkinson/cuneiforminputprototype),
> which Wedges ports to TypeScript in milestone 2. Until then, file names such as
> `strokes.js` refer to the prototype. Each port updates the names here to the new
> modules in `src/core/` (see [AGENTS.md](../AGENTS.md)).

How a single touch trace becomes a cuneiform stroke: either a **wedge** or a **Winkelhaken**. This is the first stage of the pipeline. The second stage matches a set of strokes against sign templates, and is covered in [matching.md](matching.md). The implementation is `Strokes.classify()` in `strokes.js`.

## How users draw

The design rests on three conventions about how users draw:

1. **One stroke per finger-down.** A stroke runs from pointer down to pointer up. Signs are built from several strokes, in any order.
2. **A wedge is drawn from its head.** Where the finger lands is the wide, triangular end of the wedge (the impression of the stylus corner), and the stroke runs towards the tail. Direction therefore matters: a horizontal wedge drawn right-to-left is a different wedge, although matching only penalises reversal (see [matching.md](matching.md)).
3. **A Winkelhaken is drawn as an angle without lifting the finger,** like a `<`. The corner of the angle is the Winkelhaken's point. In practice users draw it from the top leg, round the vertex, out along the bottom leg, but recognition accepts either order and any orientation.

These conventions keep each stroke unambiguous on its own, so recognition needs no knowledge of the sign being drawn.

## Output

```
{ type: 'wedge', a, b }      a = head (finger down), b = tail
{ type: 'wh', v, a, b }      v = vertex, a and b = ends of the two legs
```

Points are in canvas pixels. Each result also carries a `debug` record: the resampled points, the split point, error measures, and a short reason string such as `straight (dev 3%)` or `Winkelhaken (72°)`. The debug view draws these, and the status line shows the reason.

A wedge keeps only its two end points: the head position, the direction and the length are all that matching uses. A Winkelhaken keeps its vertex and two leg ends, from which matching derives its position, its size (mean leg length) and the direction it opens towards (the bisector of the legs).

## Algorithm

Parameters are in `Strokes.params`. The values below are the current defaults, which were set by eye and haven't been tuned on real data.

| Parameter | Default | Meaning |
|---|---|---|
| `minLength` | 10 px | Shorter traces are taps and are ignored |
| `spacing` | 3 px | Resampling distance |
| `straightTol` | 0.08 | Maximum deviation from the start→end line, as a fraction of path length, for a stroke to count as straight |
| `legRatio` | 0.3 | The shorter leg must be at least this fraction of the longer, or it is treated as a flick |
| `whMinAngle`, `whMaxAngle` | 15°, 135° | Range of the angle between the legs that counts as a Winkelhaken |

### 1. Reject taps

If the trace's path length is under `minLength`, return nothing. Accidental touches and palm contacts are common on phones.

### 2. Resample and smooth

Resample the trace to points `spacing` apart along its path, then smooth each interior point with weights 1–2–1 (end points stay fixed). Touch events arrive at uneven rates and speeds; resampling makes later measurements depend on shape rather than drawing speed, and smoothing removes jitter from the touch sensor. The page collects coalesced pointer events (`getCoalescedEvents`) so that fast strokes aren't undersampled.

### 3. Straight or not?

Measure the largest distance of any point from the straight line between the first and last points, divided by the path length. Below `straightTol`, the stroke is a **straight wedge** from first point to last. Very short traces (fewer than 5 resampled points) are also treated as straight.

Dividing by path length makes the test independent of scale. The tolerance needs to be fairly loose, because finger strokes bow noticeably.

### 4. Best two-segment fit

For each interior point k, fit two segments, first point → k and k → last point, and measure the largest deviation of any point from its segment. The k with the smallest such deviation is the corner. This works out the corner from the whole trace, rather than from local curvature, so it isn't fooled by jitter or by a rounded corner.

This step costs O(N²) in the number of resampled points. With 3 px spacing even a long stroke has only about 100 points, about 10,000 distance checks, which is negligible.

### 5. Trim flicks

If the shorter leg is less than `legRatio` times the longer one, the short leg is a flick: fingers often wiggle at the start or end of a stroke. Keep the longer leg as a **wedge**, with the first point as its head if the first leg is the long one, otherwise the corner.

This is the most important tolerance for touchscreens. Without it, a straight wedge with a small flick at the end would become a lopsided Winkelhaken.

### 6. Winkelhaken or curved wedge

Measure the angle at the corner between the two legs. If it's within `[whMinAngle, whMaxAngle]`, the stroke is a **Winkelhaken** with vertex at the corner. Otherwise it's a **curved wedge** from first point to last. Below 15° the legs nearly overlap: a back-and-forth scribble, not a deliberate angle. Above 135° it's a bowed line rather than an angle.

Opening direction isn't checked: a `>` is still a Winkelhaken. Matching compares opening direction against the template, so signs whose Winkelhaken open another way (AK, for example) still work.

## Rendering

`Strokes.draw()` renders each stroke as it would look impressed in clay, so the user sees what was recognised:

- **wedge:** a filled triangle at the head, sized in proportion to the wedge's length (8–32 px), plus a thin tapering tail to the end point
- **Winkelhaken:** a filled triangle with its point at the vertex and its sides along the two legs (10–48 px)

The same function draws template overlays: the review page, and the ghost of the best match during normal entry.

## Known limitations and ideas for production

- **Thresholds are untuned:** they were set by eye. The Test me mode records real drawings with known answers, which could be used to tune them, and the matching weights, systematically.
- **Curves can't be drawn:** a few signs contain curved shapes rather than wedges, such as KAM₄ (a semicircle), ŠAR₂ (a circle) and the variant forms of ONE THIRD and TWO THIRDS. They have no stroke type to match them, so they were left untraced. Supporting them would need a third stroke type (an arc, or a closed loop) in both recognition and matching.
- **Only one corner:** a stroke with two corners (a Z shape) becomes either a Winkelhaken or a wedge. Cuneiform has no strokes like that, but treating them as errors and asking the user to redraw might be clearer than guessing.
- **Size and length are ignored:** a deliberately short wedge (in many signs, small wedges differ from long ones) is still just a wedge. Matching compares lengths only relative to the whole sign, and only lightly.
- **Taps are ignored:** a quick tap could be offered as a shortcut for a small Winkelhaken, a common component.
- **No speed or pressure:** pressure, or stylus tilt where available, could indicate the head more reliably than stroke direction alone.
- **One finger at a time:** a second simultaneous touch is ignored. A real input method would also need gestures for space, delete and accept that can't be mistaken for strokes.
- **Reference implementation:** `strokes.js` has no dependencies and works on plain `{x, y}` points, so it could be ported to Kotlin or Swift for a native keyboard. The synthetic test, `test/synthetic.js`, generates noisy traces with flicks and reports how often stroke types are recognised correctly, which helps check that a port behaves the same.
