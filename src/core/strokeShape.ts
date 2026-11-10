/**
 * The shapes strokes leave in clay, as outlines to fill: a wedge is a
 * triangular head with a thin tail, and a Winkelhaken is an arrowhead with a
 * notch between its legs.
 */
import { distance, midpoint, pointBetween, type Point } from "@/lib/geometry"

import type { Stroke, Wedge, Winkelhaken } from "./strokes"

/** A wedge's head is never deeper than this fraction of its length. */
const MAX_HEAD_FRACTION = 0.4

/** The head's width as a multiple of its depth. */
const HEAD_WIDTH_RATIO = 0.9

/** The tail's width where it leaves the head, as a fraction of the head's width. */
const TAIL_WIDTH_FRACTION = 0.3

/**
 * How far the notch between a Winkelhaken's legs reaches towards the vertex,
 * as a fraction of the way from the midpoint of the leg ends.
 */
const NOTCH_DEPTH = 0.75

/**
 * The outline of a stroke's impression, as a closed polygon in the stroke's
 * coordinates. `headSize` is how deep a wedge's head is, in the same units:
 * real wedges have heads of much the same size whatever their length, but a
 * short wedge's head shrinks so that it keeps a tail.
 */
export function strokeOutline(stroke: Stroke, headSize: number): Point[] {
  switch (stroke.kind) {
    case "wedge":
      return wedgeOutline(stroke, headSize)
    case "winkelhaken":
      return winkelhakenOutline(stroke)
  }
}

/**
 * Five points: the two corners of the head, the two sides of the tail where
 * it leaves the head, and the tail's point between them.
 */
function wedgeOutline({ head, tail }: Wedge, headSize: number): Point[] {
  const length = distance(head, tail)

  // Unit vectors along the wedge and across it.
  const along = { x: (tail.x - head.x) / length, y: (tail.y - head.y) / length }
  const across = { x: -along.y, y: along.x }

  const depth = Math.min(headSize, MAX_HEAD_FRACTION * length)
  const halfWidth = (HEAD_WIDTH_RATIO * depth) / 2
  const tailHalfWidth = TAIL_WIDTH_FRACTION * halfWidth
  const neck = offset(head, along, depth)

  return [
    offset(head, across, halfWidth),
    offset(neck, across, tailHalfWidth),
    tail,
    offset(neck, across, -tailHalfWidth),
    offset(head, across, -halfWidth),
  ]
}

/** Four points: the vertex, one leg's end, the notch, and the other leg's end. */
function winkelhakenOutline({ vertex, legA, legB }: Winkelhaken): Point[] {
  const notch = pointBetween(midpoint(legA, legB), vertex, NOTCH_DEPTH)
  return [vertex, legA, notch, legB]
}

function offset(p: Point, direction: Point, amount: number): Point {
  return { x: p.x + amount * direction.x, y: p.y + amount * direction.y }
}
