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

/** The distance from `p` to the nearest point on the segment from `a` to `b`. */
export function segmentDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared === 0) return distance(p, a)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

/**
 * The angle at `vertex` between the lines to `a` and `b`, in radians from 0
 * to π. If either point is at the vertex, the angle is undefined, and this
 * returns π/2.
 */
export function angleAt(vertex: Point, a: Point, b: Point): number {
  const ax = a.x - vertex.x
  const ay = a.y - vertex.y
  const bx = b.x - vertex.x
  const by = b.y - vertex.y
  const cos =
    (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by) || 1)
  return Math.acos(Math.max(-1, Math.min(1, cos)))
}
