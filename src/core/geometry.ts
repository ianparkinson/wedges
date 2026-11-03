/**
 * Points and distances shared by stroke recognition and matching.
 *
 * Ported from the prototype's strokes.js (`dist`, `pathLength`).
 * See docs/stroke-recognition.md.
 */

/** A point in screen-like coordinates: x to the right, y downward. */
export interface Point {
  readonly x: number
  readonly y: number
}

/** Euclidean distance between two points. */
export function distance(p: Point, q: Point): number {
  return Math.hypot(p.x - q.x, p.y - q.y)
}

/** Total length of the polyline through `points`; 0 for fewer than two. */
export function pathLength(points: readonly Point[]): number {
  let length = 0
  for (let i = 1; i < points.length; i++) {
    // Both indices are in range: i runs from 1 to points.length - 1.
    length += distance(points[i - 1]!, points[i]!)
  }
  return length
}
