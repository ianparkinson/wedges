/**
 * Puts the features of a drawing or a skeleton into a standard frame. See
 * docs/matching.md#1-normalisation.
 */
import type { Point } from "@/lib/geometry"

import type { StrokeFeature } from "./features"

/** Stops a single point, or a drawing with no extent, dividing by zero. */
const MIN_SCALE = 1e-6

/**
 * Moves the features so that the centre of the bounding box of `keyPoints` is
 * at the origin, and scales them so that the box's longer side is 1, keeping
 * the aspect ratio. `keyPoints` are the strokes' ends, vertices and leg tips,
 * in the same frame as the features.
 */
export function normalize(
  features: readonly StrokeFeature[],
  keyPoints: readonly Point[],
): StrokeFeature[] {
  const xs = keyPoints.map((p) => p.x)
  const ys = keyPoints.map((p) => p.y)
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)]
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)]

  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const scale = Math.max(x1 - x0, y1 - y0, MIN_SCALE)
  const logScale = Math.log(scale)
  const place = (p: Point): Point => ({
    x: (p.x - cx) / scale,
    y: (p.y - cy) / scale,
  })

  return features.map((feature) => {
    switch (feature.kind) {
      case "wedge":
        return {
          ...feature,
          position: place(feature.position),
          logLength: feature.logLength - logScale,
        }
      case "winkelhaken":
        return {
          ...feature,
          position: place(feature.position),
          logSize: feature.logSize - logScale,
        }
    }
  })
}
