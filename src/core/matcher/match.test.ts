import { describe, expect, it } from "vitest"

import { parseSpec } from "@/core/spec"

import { match, prepareSample } from "./match"
import { defaultWeights } from "./pairCost"

const {
  unmatched,
  reversed,
  kindMismatch,
  winkelhakenOpening,
  winkelhakenSize,
} = defaultWeights

/** Two wedges that fix the frame, so the third stroke stays where it's put. */
const FRAME = "w 0 0 10 0; w 0 10 10 10"

function matchSpecs(drawn: string, skeleton: string, cutoff?: number) {
  return match(
    prepareSample(parseSpec(drawn)),
    prepareSample(parseSpec(skeleton)),
    defaultWeights,
    cutoff,
  )
}

describe("match", () => {
  it("doesn't care about stroke order", () => {
    const result = matchSpecs(
      "w 0 7 10 7; w 0 3 10 3",
      "w 0 3 10 3; w 0 7 10 7",
    )
    expect(result?.score).toBe(0)
    expect(result?.pairs).toEqual([
      [0, 1],
      [1, 0],
    ])
  })

  it("pairs wedges drawn tail first with their counterparts", () => {
    const result = matchSpecs(
      "w 10 5 0 5; w 5 10 5 0",
      "w 0 5 10 5; w 5 0 5 10",
    )
    expect(result?.pairs).toEqual([
      [0, 0],
      [1, 1],
    ])
    // Each pair costs only the penalty for being reversed.
    expect(result?.score).toBeCloseTo(reversed)
  })

  it("doesn't care about the order of Winkelhaken", () => {
    const result = matchSpecs(
      "h 6 5 9 3 9 7; h 4 5 1 3 1 7",
      "h 4 5 1 3 1 7; h 6 5 9 3 9 7",
    )
    expect(result?.score).toBe(0)
    expect(result?.pairs).toEqual([
      [0, 1],
      [1, 0],
    ])
  })

  it("charges a Winkelhaken opening a different way by how far it turns", () => {
    // Opening downwards rather than rightwards: a quarter turn.
    const result = matchSpecs(
      `${FRAME}; h 5 4 3 7 7 7`,
      `${FRAME}; h 5 4 8 2 8 6`,
    )
    expect(result?.pairs).toContainEqual([2, 2])
    expect(result?.score).toBeCloseTo(winkelhakenOpening / 3)
  })

  it("charges a Winkelhaken of a different size by the ratio of sizes", () => {
    const result = matchSpecs(
      `${FRAME}; h 5 4 6.5 3 6.5 5`,
      `${FRAME}; h 5 4 8 2 8 6`,
    )
    expect(result?.pairs).toContainEqual([2, 2])
    expect(result?.score).toBeCloseTo((winkelhakenSize * Math.log(2)) / 3)
  })

  it("leaves an extra drawn stroke unpaired", () => {
    const result = matchSpecs(
      "w 0 0 10 0; w 0 5 10 5; w 0 10 10 10",
      "w 0 0 10 0; w 0 10 10 10",
    )
    expect(result?.pairs).toEqual([
      [0, 0],
      [2, 1],
    ])
    expect(result?.score).toBeCloseTo(unmatched / 3)
  })

  it("charges a missing stroke as unpaired", () => {
    const result = matchSpecs(
      "w 0 0 10 0; w 0 10 10 10",
      "w 0 0 10 0; w 0 5 10 5; w 0 10 10 10",
    )
    expect(result?.pairs).toEqual([
      [0, 0],
      [1, 2],
    ])
    expect(result?.score).toBeCloseTo(unmatched / 3)
  })

  it("pairs a wedge with a Winkelhaken in the same place", () => {
    const result = matchSpecs(`${FRAME}; w 0 5 4 5`, `${FRAME}; h 2 5 8 2 8 8`)
    expect(result?.pairs).toContainEqual([2, 2])
    expect(result?.score).toBeCloseTo(kindMismatch / 3)
  })

  it("leaves a wedge and a Winkelhaken unpaired when they are far apart", () => {
    // Pairing them would cost more than leaving both unpaired.
    const result = matchSpecs(`${FRAME}; w 8 5 10 5`, `${FRAME}; h 0 5 3 3 3 7`)
    expect(result?.pairs).toEqual([
      [0, 0],
      [1, 1],
    ])
    expect(result?.score).toBeCloseTo((2 * unmatched) / 3)
  })

  it("gives up only when the score would be above the cutoff", () => {
    const drawn = "w 5 0 5 10; h 2 5 8 2 8 8"
    const skeleton = "w 0 3 10 3; w 0 7 10 7"
    const full = matchSpecs(drawn, skeleton)
    expect(matchSpecs(drawn, skeleton, full?.score)).toEqual(full)
    expect(matchSpecs(drawn, skeleton, 0.1)).toBeNull()
  })
})
