/**
 * Points and distances shared by stroke recognition and matching.
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
    length += distance(points[i - 1]!, points[i]!)
  }
  return length
}
