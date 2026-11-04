/**
 * Puts a drawing or a skeleton into a standard frame. See
 * docs/matching.md#1-normalisation.
 */
import type { Point } from "../geometry"
import type { Stroke } from "../strokes"

/** Stops a single point, or a drawing with no extent, dividing by zero. */
const MIN_SCALE = 1e-6

/** The points that define a stroke: a wedge's ends, a Winkelhaken's vertex and leg ends. */
export function keyPoints(stroke: Stroke): Point[] {
  return stroke.kind === "wedge"
    ? [stroke.head, stroke.tail]
    : [stroke.vertex, stroke.legA, stroke.legB]
}

/**
 * Moves the centre of the strokes' bounding box to the origin and scales them
 * so the box's longer side is 1, keeping the aspect ratio.
 */
export function normalize(strokes: readonly Stroke[]): Stroke[] {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const stroke of strokes) {
    for (const p of keyPoints(stroke)) {
      x0 = Math.min(x0, p.x)
      y0 = Math.min(y0, p.y)
      x1 = Math.max(x1, p.x)
      y1 = Math.max(y1, p.y)
    }
  }
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const scale = Math.max(x1 - x0, y1 - y0, MIN_SCALE)
  const f = (p: Point): Point => ({
    x: (p.x - cx) / scale,
    y: (p.y - cy) / scale,
  })
  return strokes.map((s) =>
    s.kind === "wedge"
      ? { kind: "wedge", head: f(s.head), tail: f(s.tail) }
      : {
          kind: "winkelhaken",
          vertex: f(s.vertex),
          legA: f(s.legA),
          legB: f(s.legB),
        },
  )
}
