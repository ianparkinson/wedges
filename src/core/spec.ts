/**
 * The spec notation for sign skeletons: strokes as compact text, such as
 * "w 5.1 0.1 5.1 10; h 2.8 5.8 8 2.16 8 9.44". See docs/skeleton-format.md.
 */
import type { Point } from "./geometry"
import type { Stroke } from "./strokes"

const WEDGE_OP = "w"
const WINKELHAKEN_OP = "h"

/** Parses a spec into strokes. Throws on an unknown op or a malformed number. */
export function parseSpec(spec: string): Stroke[] {
  return spec
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const stroke = parseStroke(item)
      if (!stroke) throw new Error(`Bad stroke "${item}" in spec "${spec}"`)
      return stroke
    })
}

/** The stroke written as `item`, or null if it isn't a valid stroke. */
function parseStroke(item: string): Stroke | null {
  const [op, ...args] = item.split(/\s+/)
  const numbers = args.map(Number)
  const points: Point[] = []
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    points.push({ x: numbers[i]!, y: numbers[i + 1]! })
  }

  const valid =
    numbers.length % 2 === 0 && numbers.every((n) => Number.isFinite(n))
  const [p, q, r] = points

  if (valid && op === WEDGE_OP && points.length === 2 && p && q) {
    return { kind: "wedge", head: p, tail: q }
  }
  if (valid && op === WINKELHAKEN_OP && points.length === 3 && p && q && r) {
    return { kind: "winkelhaken", vertex: p, legA: q, legB: r }
  }

  return null
}
