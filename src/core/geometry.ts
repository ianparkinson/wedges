/**
 * Points, distances and other geometry shared across the app.
 */

/** A point in screen-like coordinates: x to the right, y downward. */
export interface Point {
  readonly x: number
  readonly y: number
}

/** An upright rectangle, as `getBoundingClientRect()` gives one. */
export interface Box {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
}

/** `value` moved into the range from `min` to `max`, if it lies outside. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
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
  t = clamp(t, 0, 1)
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
  return Math.acos(clamp(cos, -1, 1))
}

/**
 * The direction from `from` to `to`, in radians from -π to π, measured from
 * the x axis towards the y axis: clockwise on screen, since y points down.
 */
export function direction(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x)
}

/**
 * The direction halfway between the directions from `vertex` to `a` and to
 * `b`, measured the short way round, in radians from -π to π as
 * {@link direction} gives them: where the angle at `vertex` opens towards.
 */
export function bisector(vertex: Point, a: Point, b: Point): number {
  const toA = direction(vertex, a)
  return wrapAngle(toA + wrapAngle(direction(vertex, b) - toA) / 2)
}

/** The point `length` from `origin` in the direction `angle`, in radians as {@link direction} gives them. */
export function pointAt(origin: Point, angle: number, length: number): Point {
  return {
    x: origin.x + length * Math.cos(angle),
    y: origin.y + length * Math.sin(angle),
  }
}

/** The point halfway between `p` and `q`. */
export function midpoint(p: Point, q: Point): Point {
  return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }
}

/** `p` turned about `centre` by `angle`, in radians as {@link direction} gives them. */
export function rotate(p: Point, centre: Point, angle: number): Point {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = p.x - centre.x
  const dy = p.y - centre.y
  return {
    x: centre.x + dx * cos - dy * sin,
    y: centre.y + dx * sin + dy * cos,
  }
}

/** `angle`, in radians, moved by a whole number of turns into the range -π to π. */
export function wrapAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle))
}

/** The absolute difference between two angles, in [0, π]. */
export function angleDifference(a: number, b: number): number {
  return Math.abs(wrapAngle(a - b))
}
