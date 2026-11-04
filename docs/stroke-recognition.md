# Stroke recognition

How a single touch trace becomes a cuneiform stroke: either a **wedge** or a **Winkelhaken**. This is the first stage of recognition. The second stage matches a set of strokes against sign templates. The implementation is `classifyTrace()` in [`src/core/strokes.ts`](../src/core/strokes.ts).

## How users draw

The design rests on three conventions about how users draw:

1. **One stroke per finger-down.** A stroke runs from pointer down to pointer up. Signs are built from several strokes, in any order.
2. **A wedge is drawn from its head.** Where the finger lands is the wide, triangular end of the wedge (the impression of the stylus corner), and the stroke runs towards the tail. Direction therefore matters: a horizontal wedge drawn right-to-left is a different wedge, although matching only penalises reversal.
3. **A Winkelhaken is drawn as an angle without lifting the finger,** like a `<`. The corner of the angle is the Winkelhaken's point. In practice users draw it from the top leg, round the vertex, out along the bottom leg, but recognition accepts either order and any orientation.

These conventions keep each stroke unambiguous on its own, so recognition needs no knowledge of the sign being drawn.

## Output

```ts
{
  kind: ("wedge", head, tail)
}
{
  kind: ("winkelhaken", vertex, legA, legB)
} // legA and legB: ends of the two legs
```

or `null` for a tap. Points are in the trace's coordinates, usually CSS pixels.

A wedge keeps only its two end points: the head position, the direction and the length are all that matching uses. A Winkelhaken keeps its vertex and two leg ends, from which matching derives its position, its size (mean leg length) and the direction it opens towards (the bisector of the legs).

## Algorithm

Parameters are in `defaultStrokeParams`. The values below were set by eye and haven't been tuned on real data.

| Parameter           | Default     | Meaning                                                                                                       |
| ------------------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| `minLength`         | 10 px       | Shorter traces are taps and are ignored                                                                       |
| `spacing`           | 3 px        | Resampling distance                                                                                           |
| `straightTolerance` | 0.08        | Maximum deviation from the start-to-end line, as a fraction of path length, for a stroke to count as straight |
| `legRatio`          | 0.3         | The shorter leg must be at least this fraction of the longer, or it is treated as a flick                     |
| `winkelhakenAngles` | [15°, 135°] | Range of the angle between the legs that counts as a Winkelhaken                                              |

### 1. Reject taps

If the trace's path length is under `minLength`, return nothing. Accidental touches and palm contacts are common on phones.

### 2. Resample and smooth

Resample the trace to points `spacing` apart along its path, then smooth it: each interior point moves to a weighted average of the point before it (weight 1), itself (weight 2) and the point after it (weight 1). The end points stay fixed. Touch events arrive at uneven rates and speeds; resampling makes later measurements depend on shape rather than drawing speed, and smoothing removes jitter from the touch sensor. The drawing pad should collect coalesced pointer events (`getCoalescedEvents`) so that fast strokes aren't undersampled.

### 3. Straight or not?

Measure the largest distance of any point from the straight line between the first and last points, divided by the path length. Below `straightTolerance`, the stroke is a **straight wedge** from first point to last. Very short traces (fewer than 5 resampled points) are also treated as straight.

Dividing by path length makes the test independent of scale. The tolerance needs to be fairly loose, because finger strokes bow noticeably.

### 4. Best two-segment fit

For each interior point k, fit two segments, first point → k and k → last point, and measure the largest deviation of any point from its segment. The k with the smallest such deviation is the corner. This works out the corner from the whole trace, rather than from local curvature, so it isn't fooled by jitter or by a rounded corner.

This step costs O(N²) in the number of resampled points. With 3 px spacing even a long stroke has only about 100 points, about 10,000 distance checks, which is negligible.

### 5. Trim flicks

If the shorter leg is less than `legRatio` times the longer one, the short leg is a flick: fingers often wiggle at the start or end of a stroke. Keep the longer leg as a **wedge**, with the first point as its head if the first leg is the long one, otherwise the corner.

This is the most important tolerance for touchscreens. Without it, a straight wedge with a small flick at the end would become a lopsided Winkelhaken.

### 6. Winkelhaken or curved wedge

Measure the angle at the corner between the two legs. If it's within `winkelhakenAngles`, the stroke is a **Winkelhaken** with vertex at the corner. Otherwise it's a **curved wedge** from first point to last. Below 15° the legs nearly overlap: a back-and-forth scribble, not a deliberate angle. Above 135° it's a bowed line rather than an angle.

Opening direction isn't checked: a `>` is still a Winkelhaken. Matching compares opening direction against the template, so signs whose Winkelhaken open another way (AK, for example) still work.

## Tests

- `src/core/strokes.test.ts`: taps, straight lines, flicks at either end, and angles either side of the Winkelhaken range.
- `test/strokeRecognition.test.ts`: 300 seeded synthetic traces (see `test/synthetic/`) of wedges and Winkelhaken a person might draw, with jitter and flicks. Each must come back as the stroke drawn, with every key point within 12 pixels of the one drawn. A failing case is named by its shape, so you can judge whether the change is acceptable.

## Known limitations and ideas

- **Thresholds are untuned:** they were set by eye. Labelled real drawings could be used to tune them, and the matching weights, systematically.
- **Curves can't be drawn:** a few signs contain curved shapes rather than wedges, such as KAM₄ (a semicircle), ŠAR₂ (a circle) and the variant forms of ONE THIRD and TWO THIRDS. They have no stroke type to match them, so they have no template. Supporting them would need a third stroke type (an arc, or a closed loop) in both recognition and matching.
- **Only one corner:** a stroke with two corners (a Z shape) becomes either a Winkelhaken or a wedge. Cuneiform has no strokes like that, but treating them as errors and asking the user to redraw might be clearer than guessing.
- **Size and length are ignored:** a deliberately short wedge (in many signs, small wedges differ from long ones) is still just a wedge. Matching compares lengths only relative to the whole sign, and only lightly.
- **Taps are ignored:** a quick tap could be offered as a shortcut for a small Winkelhaken, a common component.
- **No speed or pressure:** pressure, or stylus tilt where available, could indicate the head more reliably than stroke direction alone.
- **One finger at a time:** a second simultaneous touch is ignored. A real input method would also need gestures for space, delete and accept that can't be mistaken for strokes.
- **Portable:** `strokes.ts` has no dependencies and works on plain `{ x, y }` points, so it could be ported to Kotlin or Swift for a native keyboard. The synthetic-trace test could be run against a port to check that it behaves the same.
