/**
 * Puts a drawing or a skeleton into a standard frame. See
 * docs/matching.md#1-normalisation.
 */
import { keyPoints, mapPoints, type Stroke } from "@/core/strokes"

/** Stops a single point, or a drawing with no extent, dividing by zero. */
const MIN_SCALE = 1e-6

/**
 * Moves the centre of the strokes' bounding box to the origin and scales them
 * so the box's longer side is 1, keeping the aspect ratio.
 */
export function normalize(strokes: readonly Stroke[]): Stroke[] {
  const points = strokes.flatMap(keyPoints)
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)]
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)]

  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const scale = Math.max(x1 - x0, y1 - y0, MIN_SCALE)
  return strokes.map((stroke) =>
    mapPoints(stroke, (p) => ({
      x: (p.x - cx) / scale,
      y: (p.y - cy) / scale,
    })),
  )
}
