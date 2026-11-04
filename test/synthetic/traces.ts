/**
 * Synthetic finger traces: turns skeleton strokes into noisy point lists, as
 * a person might draw them, for tests.
 */
import type { Point } from "@/core/geometry"
import type { Stroke } from "@/core/strokes"

import type { Random } from "./random"

/** Where a sign on the 0–10 skeleton grid lands on the pad. */
export interface Placement {
  /** Pixels per grid unit. */
  readonly scale: number
  /** Where the grid's origin lands, in pixels. */
  readonly offset: Point
}

/** Points along a wedge's trace. */
const WEDGE_STEPS = 25
/** Pixel jitter along a wedge's trace. */
const WEDGE_JITTER = 1.5
/** Chance that a wedge ends with a flick. */
const FLICK_CHANCE = 0.3
const FLICK_LENGTH = 8
const FLICK_STEPS = 3
const FLICK_JITTER = 0.5
/** Points along each leg of a Winkelhaken's trace. */
const LEG_STEPS = 12
const LEG_JITTER = 1

/**
 * A noisy trace of one skeleton stroke. `noise` jitters the stroke's key
 * points, in grid units (a sign is 10 across).
 */
export function synthesizeTrace(
  stroke: Stroke,
  placement: Placement,
  noise: number,
  random: Random,
): Point[] {
  const { scale, offset } = placement
  const place = (p: Point): Point => ({
    x: offset.x + p.x * scale + random.gauss() * noise * scale,
    y: offset.y + p.y * scale + random.gauss() * noise * scale,
  })
  switch (stroke.kind) {
    case "wedge": {
      const head = place(stroke.head)
      const tail = place(stroke.tail)
      const points = line(head, tail, WEDGE_STEPS, WEDGE_JITTER, random)
      if (random.next() < FLICK_CHANCE) {
        const end = points[points.length - 1]!
        const angle = random.next() * 2 * Math.PI
        const flickEnd = {
          x: end.x + Math.cos(angle) * FLICK_LENGTH,
          y: end.y + Math.sin(angle) * FLICK_LENGTH,
        }
        points.push(...line(end, flickEnd, FLICK_STEPS, FLICK_JITTER, random))
      }
      return points
    }
    case "winkelhaken": {
      const vertex = place(stroke.vertex)
      const legA = place(stroke.legA)
      const legB = place(stroke.legB)
      return [
        ...line(legA, vertex, LEG_STEPS, LEG_JITTER, random),
        ...line(vertex, legB, LEG_STEPS, LEG_JITTER, random).slice(1),
      ]
    }
  }
}

/** `steps + 1` jittered points from p to q. */
function line(
  p: Point,
  q: Point,
  steps: number,
  jitter: number,
  random: Random,
): Point[] {
  const out: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    out.push({
      x: p.x + (q.x - p.x) * t + random.gauss() * jitter,
      y: p.y + (q.y - p.y) * t + random.gauss() * jitter,
    })
  }
  return out
}
