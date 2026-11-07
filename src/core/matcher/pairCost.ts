/**
 * The cost of pairing one drawn stroke with one skeleton stroke. See
 * docs/matching.md#3-cost-of-pairing-two-strokes.
 */
import type { StrokeFeature } from "./features"

/** Weights for {@link pairCost}. Positions are in the normalised frame, where a sign is 1 across. */
export interface MatchWeights {
  /** Per 45° of wedge direction error. */
  readonly angle: number
  /** Added when a wedge seems to be drawn tail first. */
  readonly reversed: number
  /** Per unit of distance between positions. */
  readonly position: number
  /** Per unit of |ln(length ratio)| between wedges. */
  readonly length: number
  /** Per unit of |ln(size ratio)| between Winkelhaken. */
  readonly winkelhakenSize: number
  /** Per 90° of Winkelhaken opening direction error. */
  readonly winkelhakenOpening: number
  /** A wedge paired with a Winkelhaken. */
  readonly kindMismatch: number
  /** Each extra or missing stroke. */
  readonly unmatched: number
}

export const defaultWeights: MatchWeights = {
  angle: 1.0,
  reversed: 0.8,
  position: 2.0,
  length: 0.4,
  winkelhakenSize: 0.3,
  winkelhakenOpening: 0.4,
  kindMismatch: 3.0,
  unmatched: 1.6,
}

const EIGHTH_TURN = Math.PI / 4
const QUARTER_TURN = Math.PI / 2

/** The absolute difference between two angles, in [0, π]. */
export function angleDifference(a: number, b: number): number {
  const d = Math.abs(a - b) % (2 * Math.PI)
  return d > Math.PI ? 2 * Math.PI - d : d
}

export function pairCost(
  f: StrokeFeature,
  g: StrokeFeature,
  weights: MatchWeights = defaultWeights,
): number {
  const dx = f.position.x - g.position.x
  const dy = f.position.y - g.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (f.kind === "wedge" && g.kind === "wedge") {
    const d = angleDifference(f.angle, g.angle)
    const angleCost = Math.min(
      d / EIGHTH_TURN,
      (Math.PI - d) / EIGHTH_TURN + weights.reversed,
    )
    return (
      weights.angle * angleCost +
      weights.position * distance +
      weights.length * Math.abs(f.logLength - g.logLength)
    )
  }

  if (f.kind === "winkelhaken" && g.kind === "winkelhaken") {
    return (
      weights.position * distance +
      weights.winkelhakenSize * Math.abs(f.logSize - g.logSize) +
      (weights.winkelhakenOpening * angleDifference(f.opening, g.opening)) /
        QUARTER_TURN
    )
  }

  return weights.kindMismatch + weights.position * distance
}
