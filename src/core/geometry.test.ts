import { describe, expect, it } from "vitest"

import { angleAt, distance, pathLength, segmentDistance } from "./geometry"

describe("distance", () => {
  it("is zero from a point to itself", () => {
    expect(distance({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(0)
  })

  it("measures a 3-4-5 triangle", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })
})

describe("pathLength", () => {
  it("is zero for an empty path or a single point", () => {
    expect(pathLength([])).toBe(0)
    expect(pathLength([{ x: 1, y: 1 }])).toBe(0)
  })

  it("adds up every segment", () => {
    const path = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 3, y: 10 },
    ]
    expect(pathLength(path)).toBe(11)
  })
})

describe("segmentDistance", () => {
  const a = { x: 0, y: 0 }
  const b = { x: 10, y: 0 }

  it("measures straight across to a point beside the segment", () => {
    expect(segmentDistance({ x: 4, y: 3 }, a, b)).toBe(3)
  })

  it("measures to the nearer end for a point beyond it", () => {
    expect(segmentDistance({ x: 13, y: 4 }, a, b)).toBe(5)
    expect(segmentDistance({ x: -3, y: -4 }, a, b)).toBe(5)
  })

  it("measures to the point when the segment has no length", () => {
    expect(segmentDistance({ x: 3, y: 4 }, a, a)).toBe(5)
  })
})

describe("angleAt", () => {
  const vertex = { x: 0, y: 0 }

  it("is a right angle between the axes", () => {
    expect(angleAt(vertex, { x: 5, y: 0 }, { x: 0, y: 2 })).toBeCloseTo(
      Math.PI / 2,
    )
  })

  it("is 0 for the same direction and π for opposite directions", () => {
    expect(angleAt(vertex, { x: 1, y: 1 }, { x: 3, y: 3 })).toBeCloseTo(0)
    expect(angleAt(vertex, { x: 1, y: 0 }, { x: -2, y: 0 })).toBeCloseTo(
      Math.PI,
    )
  })

  it("is π/2 when a point is at the vertex", () => {
    expect(angleAt(vertex, vertex, { x: 1, y: 0 })).toBe(Math.PI / 2)
  })
})
