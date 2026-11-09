/**
 * Tidies a recognised stroke for display, so a sign drawn by hand looks more
 * like one pressed into clay: a Winkelhaken's legs are made equal. Only the
 * picture changes; the matcher sees the strokes as drawn.
 */
import { direction, distance, pointAt } from "./geometry"
import type { Stroke, Winkelhaken } from "./strokes"

/**
 * Returns the stroke as it should be drawn. A Winkelhaken gets two legs of
 * their mean length, in the directions they were drawn. A wedge is unchanged.
 */
export function tidyStroke(stroke: Stroke): Stroke {
  switch (stroke.kind) {
    case "wedge":
      return stroke
    case "winkelhaken":
      return tidyWinkelhaken(stroke)
  }
}

function tidyWinkelhaken({ vertex, legA, legB }: Winkelhaken): Winkelhaken {
  const length = (distance(vertex, legA) + distance(vertex, legB)) / 2
  return {
    kind: "winkelhaken",
    vertex,
    legA: pointAt(vertex, direction(vertex, legA), length),
    legB: pointAt(vertex, direction(vertex, legB), length),
  }
}
