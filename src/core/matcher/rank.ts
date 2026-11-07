/**
 * Ranks signs against a drawing. See docs/matching.md#5-ranking.
 */
import type { Stroke } from "../strokes"
import { match, prepareSample, type Match, type PreparedSample } from "./match"
import { defaultWeights, type MatchWeights } from "./pairCost"

/** Anything with samples to match against, usually a sign. */
export interface Rankable {
  readonly samples: readonly PreparedSample[]
}

export interface Ranked<S extends Rankable> extends Match {
  readonly sign: S
  /** The sample that matched best. */
  readonly sample: PreparedSample
}

export interface RankOptions<S extends Rankable> {
  /** How many results to return. Fewer means more signs can be skipped. */
  readonly limit?: number
  /** Only signs for which this returns true are ranked. */
  readonly filter?: (sign: S) => boolean
  readonly weights?: MatchWeights
}

/**
 * The best `limit` signs for a drawing, best first, each scored by its best
 * sample. Signs whose score can't reach the top `limit` are skipped without
 * being matched. Ties keep the order of `signs`.
 */
export function rank<S extends Rankable>(
  drawing: readonly Stroke[],
  signs: readonly S[],
  { limit = Infinity, filter, weights = defaultWeights }: RankOptions<S> = {},
): Ranked<S>[] {
  if (drawing.length === 0) return []
  const prepared = prepareSample(drawing)
  const queue = signs
    .filter((sign) => filter?.(sign) ?? true)
    .map((sign) => ({
      sign,
      bound: Math.min(
        ...sign.samples.map((s) => scoreLowerBound(prepared, s, weights)),
      ),
    }))
    .sort((a, b) => a.bound - b.bound)

  const results: Ranked<S>[] = []
  const topScores: number[] = []
  let cutoff = Infinity

  for (const { sign, bound } of queue) {
    // The queue is in order of bound, so no later sign can make the top
    // `limit` either.
    if (bound > cutoff) break
    const best = bestMatch(prepared, sign, weights, cutoff)
    if (best) {
      results.push(best)

      // Once there are `limit` results, a sign must beat the worst of them.
      insertSorted(topScores, best.score)
      if (topScores.length > limit) topScores.pop()
      if (topScores.length === limit) cutoff = topScores[limit - 1]!
    }
  }

  return results.sort((a, b) => a.score - b.score).slice(0, limit)
}

/**
 * The best match among the sign's samples, or undefined if none scores
 * within `cutoff`.
 */
function bestMatch<S extends Rankable>(
  drawn: PreparedSample,
  sign: S,
  weights: MatchWeights,
  cutoff: number,
): Ranked<S> | undefined {
  let best: Ranked<S> | undefined
  for (const sample of sign.samples) {
    const result =
      scoreLowerBound(drawn, sample, weights) <= cutoff
        ? match(drawn, sample, weights, cutoff)
        : null
    if (result && (!best || result.score < best.score)) {
      best = { ...result, sign, sample }
    }
  }
  return best
}

/**
 * The lowest score `sample` could get against `drawn`, from stroke counts
 * alone. The longer list has strokes left unpaired, as many as the difference
 * in counts, and each wedge left over after pairing wedges with wedges, and
 * Winkelhaken with Winkelhaken, is either unpaired or paired with the other
 * kind.
 */
export function scoreLowerBound(
  drawn: PreparedSample,
  sample: PreparedSample,
  weights: MatchWeights = defaultWeights,
): number {
  const drawnCount = drawn.features.length
  const sampleCount = sample.features.length
  const unpaired = Math.abs(drawnCount - sampleCount)
  const kindExcess =
    Math.abs(drawn.wedges - sample.wedges) +
    Math.abs(drawnCount - drawn.wedges - (sampleCount - sample.wedges))
  const mismatchedPairs = (kindExcess - unpaired) / 2
  const mismatchCost = Math.min(weights.kindMismatch, 2 * weights.unmatched)
  return (
    (weights.unmatched * unpaired + mismatchCost * mismatchedPairs) /
    Math.max(drawnCount, sampleCount)
  )
}

/** Inserts `value` into the ascending list `values`, after any equal values. */
function insertSorted(values: number[], value: number): void {
  const index = values.findIndex((v) => v > value)
  values.splice(index === -1 ? values.length : index, 0, value)
}
