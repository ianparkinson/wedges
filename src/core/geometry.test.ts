import { describe, expect, it } from "vitest"

import {
  angleAt,
  clamp,
  direction,
  distance,
  midpoint,
  pathLength,
  pointAt,
  rotate,
  segmentDistance,
  wrapAngle,
} from "./geometry"

describe("clamp", () => {
  it("leaves a value inside the range as it is", () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
  })

  it("moves a value outside the range to the nearer end", () => {
    expect(clamp(-3, 0, 1)).toBe(0)
    expect(clamp(7, 0, 1)).toBe(1)
  })
})

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

describe("direction", () => {
  it("is 0 along the x axis", () => {
    expect(direction({ x: 1, y: 1 }, { x: 5, y: 1 })).toBe(0)
  })

  it("is π/2 straight down the screen", () => {
    expect(direction({ x: 1, y: 1 }, { x: 1, y: 5 })).toBeCloseTo(Math.PI / 2)
  })

  it("is -π/2 straight up the screen", () => {
    expect(direction({ x: 1, y: 1 }, { x: 1, y: -3 })).toBeCloseTo(-Math.PI / 2)
  })
})

describe("pointAt", () => {
  it("goes along the x axis for angle 0", () => {
    const p = pointAt({ x: 1, y: 2 }, 0, 5)
    expect(p.x).toBeCloseTo(6)
    expect(p.y).toBeCloseTo(2)
  })

  it("goes down the screen for angle π/2", () => {
    const p = pointAt({ x: 1, y: 2 }, Math.PI / 2, 5)
    expect(p.x).toBeCloseTo(1)
    expect(p.y).toBeCloseTo(7)
  })

  it("undoes direction and distance", () => {
    const from = { x: 3, y: -2 }
    const to = { x: -4, y: 6 }
    const p = pointAt(from, direction(from, to), distance(from, to))
    expect(p.x).toBeCloseTo(to.x)
    expect(p.y).toBeCloseTo(to.y)
  })
})

describe("midpoint", () => {
  it("is halfway between the points", () => {
    expect(midpoint({ x: 0, y: 2 }, { x: 4, y: -6 })).toEqual({ x: 2, y: -2 })
  })
})

describe("rotate", () => {
  it("turns a quarter turn clockwise on screen for π/2", () => {
    const p = rotate({ x: 3, y: 1 }, { x: 1, y: 1 }, Math.PI / 2)
    expect(p.x).toBeCloseTo(1)
    expect(p.y).toBeCloseTo(3)
  })

  it("leaves the centre where it is", () => {
    const p = rotate({ x: 1, y: 1 }, { x: 1, y: 1 }, 1)
    expect(p.x).toBeCloseTo(1)
    expect(p.y).toBeCloseTo(1)
  })
})

describe("wrapAngle", () => {
  it("leaves an angle between -π and π as it is", () => {
    expect(wrapAngle(1)).toBeCloseTo(1)
    expect(wrapAngle(-3)).toBeCloseTo(-3)
  })

  it("moves an angle past π round to the negative side", () => {
    expect(wrapAngle(1.5 * Math.PI)).toBeCloseTo(-0.5 * Math.PI)
  })

  it("takes off whole turns", () => {
    expect(wrapAngle(1 + 4 * Math.PI)).toBeCloseTo(1)
  })
})
