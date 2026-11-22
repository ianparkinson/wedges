/**
 * Synthetic drawings of whole signs: each skeleton stroke traced with noise,
 * in random order, and recognised as a user's strokes would be.
 */
import { classifyTrace, type Stroke } from "@/core/strokes"

import type { Random } from "./random"
import { synthesizeTrace } from "./traces"

/**
 * A drawing of `skeleton`, normalised strokes 1 across as `skeletonStrokes()`
 * gives them, at a random size and position on the pad. `noise` is a fraction
 * of the sign's size.
 */
export function synthesizeDrawing(
  skeleton: readonly Stroke[],
  noise: number,
  random: Random,
): Stroke[] {
  const placement = {
    scale: random.between(200, 350),
    offset: { x: random.between(40, 80), y: random.between(40, 80) },
  }
  return random
    .shuffle(skeleton)
    .map((stroke) =>
      classifyTrace(synthesizeTrace(stroke, placement, noise, random)),
    )
    .filter((stroke) => stroke !== null)
}
