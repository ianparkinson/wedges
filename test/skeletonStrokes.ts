/**
 * A skeleton's shapes as the strokes a person would draw, for tests that
 * simulate drawing a sign.
 */
import { parseShape, shapeKeyPoints } from "@/core/skeleton"
import { wedge, winkelhaken, type Stroke } from "@/core/strokes"
import type { Point } from "@/lib/geometry"
import { maxOf, minOf } from "@/lib/numbers"

/**
 * The strokes of a skeleton, y pointing down, centred on the origin and scaled
 * so that the longer side of the box around their key points is 1.
 */
export function skeletonStrokes(
  shapes: readonly string[],
  winkelhakenAngle: number,
): Stroke[] {
  const points = shapes.map((s) =>
    shapeKeyPoints(parseShape(s), winkelhakenAngle),
  )
  const all = points.flat()
  const xs = all.map((p) => p.x)
  const ys = all.map((p) => p.y)
  const [x0, x1, y0, y1] = [minOf(xs), maxOf(xs), minOf(ys), maxOf(ys)]
  const scale = Math.max(x1 - x0, y1 - y0)
  const place = ({ x, y }: Point): Point => ({
    x: (x - (x0 + x1) / 2) / scale,
    y: (y - (y0 + y1) / 2) / scale,
  })

  return points.map((stroke) => {
    const [a, b, c] = stroke.map(place)
    return c ? winkelhaken(a!, b!, c) : wedge(a!, b!)
  })
}
