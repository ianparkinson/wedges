import { describe, expect, it } from "vitest"

import type { StrokeFeature } from "./features"
import { match, type PreparedSample } from "./match"
import { defaultWeights } from "./pairCost"

const {
  unmatched,
  reversed,
  kindMismatch,
  winkelhakenOpening,
  winkelhakenSize,
} = defaultWeights

const DEGREES = Math.PI / 180

/** A wedge's features: its midpoint, direction in degrees (y down), and length. */
function wedge(
  x: number,
  y: number,
  direction: number,
  length: number,
): StrokeFeature {
  return {
    kind: "wedge",
    position: { x, y },
    angle: direction * DEGREES,
    logLength: Math.log(length),
  }
}

/** A Winkelhaken's features: its vertex, opening direction in degrees, and leg length. */
function winkelhaken(
  x: number,
  y: number,
  opening: number,
  size: number,
): StrokeFeature {
  return {
    kind: "winkelhaken",
    position: { x, y },
    logSize: Math.log(size),
    opening: opening * DEGREES,
  }
}

/** Features already in the normalised frame, where a sign is 1 across. */
function sample(...features: StrokeFeature[]): PreparedSample {
  return { features, wedges: features.filter((f) => f.kind === "wedge").length }
}

describe("match", () => {
  it("doesn't care about stroke order", () => {
    const result = match(
      sample(wedge(0.5, 0.7, 0, 1), wedge(0.5, 0.3, 0, 1)),
      sample(wedge(0.5, 0.3, 0, 1), wedge(0.5, 0.7, 0, 1)),
    )
    expect(result?.score).toBe(0)
    expect(result?.pairs).toEqual([
      [0, 1],
      [1, 0],
    ])
  })

  it("pairs wedges drawn tail first with their counterparts", () => {
    const result = match(
      sample(wedge(0.5, 0.5, 180, 1), wedge(0.5, 0.5, -90, 1)),
      sample(wedge(0.5, 0.5, 0, 1), wedge(0.5, 0.5, 90, 1)),
    )
    expect(result?.pairs).toEqual([
      [0, 0],
      [1, 1],
    ])
    // Each pair costs only the penalty for being reversed.
    expect(result?.score).toBeCloseTo(reversed)
  })

  it("doesn't care about the order of Winkelhaken", () => {
    const result = match(
      sample(winkelhaken(0.6, 0.5, 0, 0.3), winkelhaken(0.4, 0.5, 180, 0.3)),
      sample(winkelhaken(0.4, 0.5, 180, 0.3), winkelhaken(0.6, 0.5, 0, 0.3)),
    )
    expect(result?.score).toBe(0)
    expect(result?.pairs).toEqual([
      [0, 1],
      [1, 0],
    ])
  })

  it("charges a Winkelhaken opening a different way by how far it turns", () => {
    // Opening downwards rather than rightwards: a quarter turn.
    const result = match(
      sample(winkelhaken(0.5, 0.4, 90, 0.3)),
      sample(winkelhaken(0.5, 0.4, 0, 0.3)),
    )
    expect(result?.pairs).toEqual([[0, 0]])
    expect(result?.score).toBeCloseTo(winkelhakenOpening)
  })

  it("charges a Winkelhaken of a different size by the ratio of sizes", () => {
    const result = match(
      sample(winkelhaken(0.5, 0.4, 0, 0.15)),
      sample(winkelhaken(0.5, 0.4, 0, 0.3)),
    )
    expect(result?.pairs).toEqual([[0, 0]])
    expect(result?.score).toBeCloseTo(winkelhakenSize * Math.log(2))
  })

  it("leaves an extra drawn stroke unpaired", () => {
    const result = match(
      sample(wedge(0.5, 0, 0, 1), wedge(0.5, 0.5, 0, 1), wedge(0.5, 1, 0, 1)),
      sample(wedge(0.5, 0, 0, 1), wedge(0.5, 1, 0, 1)),
    )
    expect(result?.pairs).toEqual([
      [0, 0],
      [2, 1],
    ])
    expect(result?.score).toBeCloseTo(unmatched / 3)
  })

  it("charges a missing stroke as unpaired", () => {
    const result = match(
      sample(wedge(0.5, 0, 0, 1), wedge(0.5, 1, 0, 1)),
      sample(wedge(0.5, 0, 0, 1), wedge(0.5, 0.5, 0, 1), wedge(0.5, 1, 0, 1)),
    )
    expect(result?.pairs).toEqual([
      [0, 0],
      [1, 2],
    ])
    expect(result?.score).toBeCloseTo(unmatched / 3)
  })

  it("pairs a wedge with a Winkelhaken in the same place", () => {
    const result = match(
      sample(wedge(0.2, 0.5, 0, 0.4)),
      sample(winkelhaken(0.2, 0.5, 0, 0.6)),
    )
    expect(result?.pairs).toEqual([[0, 0]])
    expect(result?.score).toBeCloseTo(kindMismatch)
  })

  it("leaves a wedge and a Winkelhaken unpaired when they are far apart", () => {
    // Pairing them would cost more than leaving both unpaired.
    const result = match(
      sample(wedge(0.9, 0.5, 0, 0.2)),
      sample(winkelhaken(0, 0.5, 0, 0.3)),
    )
    expect(result?.pairs).toEqual([])
    expect(result?.score).toBeCloseTo(2 * unmatched)
  })

  it("gives up only when the score would be above the cutoff", () => {
    const drawn = sample(wedge(0.5, 0.5, 90, 1), winkelhaken(0.2, 0.5, 0, 0.6))
    const skeleton = sample(wedge(0.5, 0.3, 0, 1), wedge(0.5, 0.7, 0, 1))
    const full = match(drawn, skeleton)
    expect(match(drawn, skeleton, defaultWeights, full?.score)).toEqual(full)
    expect(match(drawn, skeleton, defaultWeights, 0.1)).toBeNull()
  })
})
