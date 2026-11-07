/**
 * Scores a drawing against one sample. See
 * docs/matching.md#4-pairing-strokes-the-assignment-problem.
 */
import { munkres } from "munkres"

import type { Stroke } from "../strokes"
import { strokeFeature, type StrokeFeature } from "./features"
import { normalize } from "./normalize"
import { defaultWeights, pairCost, type MatchWeights } from "./pairCost"

/** A drawing or skeleton, normalised and reduced to features, ready to match. */
export interface PreparedSample {
  readonly features: readonly StrokeFeature[]
  /** How many of the features are wedges; the rest are Winkelhaken. */
  readonly wedges: number
}

/** Normalises a drawing or skeleton and reduces it to features, ready for {@link match}. */
export function prepareSample(strokes: readonly Stroke[]): PreparedSample {
  const features = normalize(strokes).map(strokeFeature)
  const wedges = features.filter((f) => f.kind === "wedge").length
  return { features, wedges }
}

/** How well a drawing matches a sample, and which strokes were paired. */
export interface Match {
  /** Total cost divided by the larger stroke count; lower is better. */
  readonly score: number
  /** Pairs of [drawn stroke index, skeleton stroke index]. */
  readonly pairs: readonly (readonly [number, number])[]
}

/** Allows for rounding when comparing a lower bound with a score. */
const BOUND_TOLERANCE = 1e-9

/**
 * Scores a drawing against one sample: the cheapest one-to-one pairing of
 * drawn and skeleton strokes, where each unpaired stroke costs
 * `weights.unmatched`. Returns null, without solving the pairing, when the
 * score is sure to be above `cutoff`.
 */
export function match(
  drawn: PreparedSample,
  skeleton: PreparedSample,
  weights: MatchWeights = defaultWeights,
  cutoff = Infinity,
): Match | null {
  const strokeCount = Math.max(drawn.features.length, skeleton.features.length)
  if (drawn.features.length === 0 || skeleton.features.length === 0) {
    return { score: weights.unmatched, pairs: [] }
  }

  // Capping a pair's cost at two unpaired strokes keeps the option of
  // leaving both unpaired.
  const cap = 2 * weights.unmatched

  // Plain arrays: munkres solves typed-array rows several times slower.
  const costs = drawn.features.map((d) =>
    skeleton.features.map((s) => Math.min(pairCost(d, s, weights), cap)),
  )

  // rank() passes the worst score it is still keeping as the cutoff, so if
  // even the lower bound is above it, solving would be wasted work.
  const bound = lowerBound(costs, weights.unmatched)
  if (bound / strokeCount - BOUND_TOLERANCE > cutoff) return null

  // The solver pairs every stroke of the shorter list, leaving the rest of
  // the longer one unpaired.
  const unpairedCount = Math.abs(
    drawn.features.length - skeleton.features.length,
  )
  let total = unpairedCount * weights.unmatched
  const pairs: [number, number][] = []
  for (const [i, j] of munkres(costs, { finite: true })) {
    const cost = costs[i]![j]!
    total += cost
    if (cost < cap) pairs.push([i, j])
  }

  return { score: total / strokeCount, pairs }
}

/**
 * A lower bound on the total cost of pairing, given the cost of every
 * possible pair as rows of drawn strokes by columns of skeleton strokes. It
 * is the larger of the bounds from the drawn strokes and from the skeleton
 * strokes; see {@link boundFromStrokes}.
 */
function lowerBound(
  costs: readonly (readonly number[])[],
  unmatched: number,
): number {
  // Found in one pass, without copying the matrix: match() runs this for
  // every sample that ranking doesn't skip.
  const rowCheapest = new Float64Array(costs.length).fill(Infinity)
  const columnCheapest = new Float64Array(costs[0]!.length).fill(Infinity)
  costs.forEach((row, i) => {
    row.forEach((cost, j) => {
      rowCheapest[i] = Math.min(rowCheapest[i]!, cost)
      columnCheapest[j] = Math.min(columnCheapest[j]!, cost)
    })
  })
  return Math.max(
    boundFromStrokes(rowCheapest, columnCheapest.length, unmatched),
    boundFromStrokes(columnCheapest, rowCheapest.length, unmatched),
  )
}

/**
 * A lower bound on the total cost from one list of strokes, given each
 * stroke's cheapest pair with the `otherCount` strokes of the other list. If
 * this list is no longer than the other, each of its strokes is paired, so
 * pays at least its cheapest pair, and the other list's extra strokes pay
 * `unmatched` each. If it is longer, each stroke pays at least its cheapest
 * pair or `unmatched`, whichever is less.
 */
function boundFromStrokes(
  cheapestPairs: Float64Array,
  otherCount: number,
  unmatched: number,
): number {
  const allPaired = cheapestPairs.length <= otherCount
  let total = 0
  for (const cheapest of cheapestPairs) {
    total += allPaired ? cheapest : Math.min(cheapest, unmatched)
  }
  if (allPaired) total += (otherCount - cheapestPairs.length) * unmatched
  return total
}
