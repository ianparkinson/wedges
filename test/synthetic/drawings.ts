/**
 * Synthetic drawings of whole signs: each skeleton stroke traced with noise,
 * in random order, and recognised as a user's strokes would be.
 */
import { classifyTrace, type Stroke } from "@/core/strokes"

import type { Random } from "./random"
import { synthesizeTrace } from "./traces"

/** A drawing of `skeleton`, at a random size and position on the pad. */
export function synthesizeDrawing(
  skeleton: readonly Stroke[],
  noise: number,
  random: Random,
): Stroke[] {
  const placement = {
    scale: random.between(20, 35),
    offset: { x: random.between(40, 80), y: random.between(40, 80) },
  }
  return random
    .shuffle(skeleton)
    .map((stroke) =>
      classifyTrace(synthesizeTrace(stroke, placement, noise, random)),
    )
    .filter((stroke) => stroke !== null)
}
