import { describe, expect, it } from "vitest"

import type { Stroke } from "../strokes"
import { strokeFeature } from "./features"
import { angleDifference, defaultWeights, pairCost } from "./pairCost"

const w = defaultWeights

function wedge(x1: number, y1: number, x2: number, y2: number) {
  const stroke: Stroke = {
    kind: "wedge",
    head: { x: x1, y: y1 },
    tail: { x: x2, y: y2 },
  }
  return strokeFeature(stroke)
}

function winkelhaken(vx: number, vy: number, size: number) {
  const stroke: Stroke = {
    kind: "winkelhaken",
    vertex: { x: vx, y: vy },
    legA: { x: vx + size, y: vy - size },
    legB: { x: vx + size, y: vy + size },
  }
  return strokeFeature(stroke)
}

describe("angleDifference", () => {
  it("wraps around", () => {
    expect(angleDifference(0.1, 2 * Math.PI - 0.1)).toBeCloseTo(0.2)
    expect(angleDifference(-Math.PI, Math.PI)).toBeCloseTo(0)
  })
})

describe("pairCost", () => {
  it("is zero for identical strokes", () => {
    expect(pairCost(wedge(0, 0, 1, 0), wedge(0, 0, 1, 0))).toBe(0)
    expect(pairCost(winkelhaken(0, 0, 1), winkelhaken(0, 0, 1))).toBe(0)
  })

  it("charges a reversed wedge much less than a half turn", () => {
    expect(pairCost(wedge(1, 0, 0, 0), wedge(0, 0, 1, 0))).toBeCloseTo(
      w.reversed,
    )
  })

  it("charges per 45° of direction error", () => {
    expect(pairCost(wedge(0, 0, 1, 1), wedge(0, 0, 2, 0))).toBeCloseTo(
      w.angle +
        w.position * Math.hypot(0.5, 0.5) +
        w.length * Math.abs(Math.log(Math.SQRT2 / 2)),
    )
  })

  it("charges length and size as log ratios", () => {
    const half = pairCost(winkelhaken(0, 0, 1), winkelhaken(0, 0, 2))
    const double = pairCost(winkelhaken(0, 0, 2), winkelhaken(0, 0, 1))
    expect(half).toBeCloseTo(w.winkelhakenSize * Math.log(2))
    expect(double).toBeCloseTo(half)
  })

  it("charges a wedge against a Winkelhaken the mismatch plus distance", () => {
    expect(pairCost(wedge(-1, 0, 1, 0), winkelhaken(0, 1, 1))).toBeCloseTo(
      w.kindMismatch + w.position,
    )
  })
})
