/**
 * Stroke recognition: turns one touch trace into a wedge or a Winkelhaken.
 * See docs/stroke-recognition.md.
 */
import {
  angleAt,
  distance,
  pathLength,
  pointBetween,
  segmentDistance,
  type Point,
} from "./geometry"

/** A straight wedge, drawn from its head (the wide end) towards its tail. */
export interface Wedge {
  readonly kind: "wedge"
  readonly head: Point
  readonly tail: Point
}

/** A Winkelhaken: an angle with its point at `vertex` and legs ending at `legA` and `legB`. */
export interface Winkelhaken {
  readonly kind: "winkelhaken"
  readonly vertex: Point
  readonly legA: Point
  readonly legB: Point
}

/** A recognised stroke: a wedge or a Winkelhaken. */
export type Stroke = Wedge | Winkelhaken

/** The points that define a stroke: a wedge's ends, a Winkelhaken's vertex and leg ends. */
export function keyPoints(stroke: Stroke): Point[] {
  switch (stroke.kind) {
    case "wedge":
      return [stroke.head, stroke.tail]
    case "winkelhaken":
      return [stroke.vertex, stroke.legA, stroke.legB]
  }
}

/** The stroke with `f` applied to each of its key points. */
export function mapPoints(stroke: Wedge, f: (p: Point) => Point): Wedge
export function mapPoints(
  stroke: Winkelhaken,
  f: (p: Point) => Point,
): Winkelhaken
export function mapPoints(stroke: Stroke, f: (p: Point) => Point): Stroke
export function mapPoints(stroke: Stroke, f: (p: Point) => Point): Stroke {
  switch (stroke.kind) {
    case "wedge":
      return wedge(f(stroke.head), f(stroke.tail))
    case "winkelhaken":
      return winkelhaken(f(stroke.vertex), f(stroke.legA), f(stroke.legB))
  }
}

/** Thresholds for {@link classifyTrace}. Lengths are in the trace's own units, usually CSS pixels. */
export interface StrokeParams {
  /** Traces shorter than this are taps, and are ignored. */
  readonly minLength: number
  /** Distance between points after resampling. */
  readonly spacing: number
  /** Largest deviation from the start-to-end line, as a fraction of path length, for a straight wedge. */
  readonly straightTolerance: number
  /** The shorter leg must be at least this fraction of the longer, or it is a flick. */
  readonly legRatio: number
  /** The range of angles between the legs, in degrees and inclusive, that counts as a Winkelhaken. */
  readonly winkelhakenAngles: readonly [min: number, max: number]
}

/** The thresholds the app uses, set by eye. See docs/stroke-recognition.md. */
export const defaultStrokeParams: StrokeParams = {
  minLength: 10,
  spacing: 3,
  straightTolerance: 0.08,
  legRatio: 0.3,
  winkelhakenAngles: [15, 135],
}

/** Fewer resampled segments than this always make a straight wedge. */
const MIN_SEGMENTS_FOR_CORNER = 4

/** The last point is kept if it lies further than this from the last resampled one. */
const RESAMPLE_END_TOLERANCE = 0.5

/**
 * Classifies one trace, from pointer down to pointer up, as a wedge or a
 * Winkelhaken. Returns null for a tap. The result's points are in the trace's
 * coordinates.
 */
export function classifyTrace(
  trace: readonly Point[],
  params: StrokeParams = defaultStrokeParams,
): Stroke | null {
  const length = pathLength(trace)
  if (length < params.minLength) return null

  const points = smooth(resample(trace, params.spacing))
  const last = points.length - 1

  // A trace at least minLength long resamples to several points.
  const first = points[0]!
  const end = points[last]!

  const straightError = maxDeviation(points, 0, last) / length
  if (
    straightError < params.straightTolerance ||
    last < MIN_SEGMENTS_FOR_CORNER
  ) {
    return wedge(first, end)
  }

  const corner = points[bestCorner(points)]!
  const legA = distance(first, corner)
  const legB = distance(corner, end)

  // A much shorter leg is a flick at the start or end of a wedge: keep the longer leg.
  if (Math.min(legA, legB) < params.legRatio * Math.max(legA, legB)) {
    return legA > legB ? wedge(first, corner) : wedge(corner, end)
  }

  const degrees = (angleAt(corner, first, end) * 180) / Math.PI
  const [minAngle, maxAngle] = params.winkelhakenAngles
  if (degrees >= minAngle && degrees <= maxAngle) {
    return winkelhaken(corner, first, end)
  }
  return wedge(first, end)
}

function wedge(head: Point, tail: Point): Wedge {
  return { kind: "wedge", head, tail }
}

function winkelhaken(vertex: Point, legA: Point, legB: Point): Winkelhaken {
  return { kind: "winkelhaken", vertex, legA, legB }
}

/** Points `spacing` apart along the path, keeping the first and last. */
export function resample(points: readonly Point[], spacing: number): Point[] {
  const start = points[0]
  if (start === undefined || points.length < 2) return [...points]
  const out = [start]

  // Walk the path a segment at a time. `travelled` is the distance along the
  // path since the last point added. Whenever the current segment would take
  // it past `spacing`, add a point exactly `spacing` along, and carry on from
  // that point.
  let travelled = 0
  let from = start
  for (const to of points.slice(1)) {
    let remaining = distance(from, to)
    while (travelled + remaining >= spacing && remaining > 0) {
      const next = pointBetween(from, to, (spacing - travelled) / remaining)
      out.push(next)
      from = next
      remaining = distance(from, to)
      travelled = 0
    }
    travelled += remaining
    from = to
  }
  const end = points[points.length - 1]!
  if (distance(out[out.length - 1]!, end) > RESAMPLE_END_TOLERANCE) {
    out.push(end)
  }
  return out
}

/**
 * Smooths the path by moving each interior point towards its neighbours: the
 * new point is a weighted average of the point before (weight 1), the point
 * itself (weight 2) and the point after (weight 1). The end points stay fixed.
 */
export function smooth(points: readonly Point[]): Point[] {
  if (points.length < 3) return [...points]
  return points.map((p, i) => {
    const before = points[i - 1]
    const after = points[i + 1]
    if (before === undefined || after === undefined) return p
    return {
      x: (before.x + 2 * p.x + after.x) / 4,
      y: (before.y + 2 * p.y + after.y) / 4,
    }
  })
}

/** The index of the interior point that best splits the path into two straight segments. */
function bestCorner(points: readonly Point[]): number {
  const last = points.length - 1

  let best = 1
  let bestError = Infinity

  for (let k = 1; k < last; k++) {
    const error = Math.max(
      maxDeviation(points, 0, k),
      maxDeviation(points, k, last),
    )
    if (error < bestError) {
      bestError = error
      best = k
    }
  }

  return best
}

/** The largest distance of points i..j from the segment between points i and j. */
function maxDeviation(points: readonly Point[], i: number, j: number): number {
  const a = points[i]!
  const b = points[j]!
  let max = 0
  for (let k = i; k <= j; k++) {
    max = Math.max(max, segmentDistance(points[k]!, a, b))
  }
  return max
}
