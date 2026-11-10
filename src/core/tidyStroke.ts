/**
 * Tidies a recognised stroke for display, so a sign drawn by hand looks more
 * like one pressed into clay: a Winkelhaken's legs are made equal, and a
 * stroke that is nearly horizontal, vertical or diagonal can be turned to lie
 * exactly so. Only the picture changes; the matcher sees the strokes as drawn.
 */
import {
  bisector,
  direction,
  distance,
  midpoint,
  pointAt,
  rotate,
} from "@/lib/geometry"

import { mapPoints, type Stroke, type Wedge, type Winkelhaken } from "./strokes"

/** The directions strokes snap to: every multiple of 45°, in radians. */
const SNAP_STEP = Math.PI / 4

/**
 * Returns the stroke as it should be drawn. A Winkelhaken gets two legs of
 * their mean length, in the directions they were drawn. Then, if the stroke
 * points within `snapTolerance` radians of horizontal, vertical or diagonal,
 * it is turned to point exactly that way: a wedge about its midpoint, and a
 * Winkelhaken about its vertex, by the line halfway between its legs.
 */
export function tidyStroke(stroke: Stroke, snapTolerance: number): Stroke {
  switch (stroke.kind) {
    case "wedge":
      return tidyWedge(stroke, snapTolerance)
    case "winkelhaken":
      return tidyWinkelhaken(stroke, snapTolerance)
  }
}

function tidyWedge(wedge: Wedge, snapTolerance: number): Wedge {
  const turn = snapTurn(direction(wedge.head, wedge.tail), snapTolerance)
  if (turn === 0) return wedge

  const middle = midpoint(wedge.head, wedge.tail)
  return mapPoints(wedge, (p) => rotate(p, middle, turn))
}

function tidyWinkelhaken(
  winkelhaken: Winkelhaken,
  snapTolerance: number,
): Winkelhaken {
  const { vertex, legA, legB } = winkelhaken
  const length = (distance(vertex, legA) + distance(vertex, legB)) / 2
  const a = direction(vertex, legA)
  const b = direction(vertex, legB)

  const turn = snapTurn(bisector(vertex, legA, legB), snapTolerance)

  return {
    kind: "winkelhaken",
    vertex,
    legA: pointAt(vertex, a + turn, length),
    legB: pointAt(vertex, b + turn, length),
  }
}

/**
 * The turn, in radians, that takes `angle` to the nearest multiple of 45°, if
 * it is within `tolerance` of one, and 0 otherwise.
 */
function snapTurn(angle: number, tolerance: number): number {
  const turn = Math.round(angle / SNAP_STEP) * SNAP_STEP - angle
  return Math.abs(turn) <= tolerance ? turn : 0
}
