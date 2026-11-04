import { describe, expect, it } from "vitest"

import type { Point } from "./geometry"
import { classifyTrace, resample, smooth } from "./strokes"

/** Points every 1 unit along the polyline through `corners`. */
function path(...corners: Point[]): Point[] {
  const points: Point[] = [corners[0]!]
  for (let i = 1; i < corners.length; i++) {
    const from = corners[i - 1]!
    const to = corners[i]!
    const steps = Math.ceil(Math.hypot(to.x - from.x, to.y - from.y))
    for (let s = 1; s <= steps; s++) {
      points.push({
        x: from.x + ((to.x - from.x) * s) / steps,
        y: from.y + ((to.y - from.y) * s) / steps,
      })
    }
  }
  return points
}

/** The corners of a `<` with legs of `length` meeting at `angle` degrees, vertex at the origin. */
function angle(degrees: number, length = 60): Point[] {
  const half = (degrees / 2) * (Math.PI / 180)
  return path(
    { x: length * Math.cos(half), y: -length * Math.sin(half) },
    { x: 0, y: 0 },
    { x: length * Math.cos(half), y: length * Math.sin(half) },
  )
}

describe("classifyTrace", () => {
  it("ignores a tap", () => {
    expect(classifyTrace(path({ x: 0, y: 0 }, { x: 5, y: 5 }))).toBeNull()
    expect(classifyTrace([])).toBeNull()
  })

  it("reads a straight line as a wedge from its first point", () => {
    expect(classifyTrace(path({ x: 100, y: 50 }, { x: 0, y: 50 }))).toEqual({
      kind: "wedge",
      head: { x: 100, y: 50 },
      tail: { x: 0, y: 50 },
    })
  })

  it("trims a flick at the end of a wedge", () => {
    const stroke = classifyTrace(
      path({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 105, y: 20 }),
    )
    expect(stroke?.kind).toBe("wedge")
    expect(stroke).toMatchObject({ head: { x: 0, y: 0 } })
  })

  it("trims a flick at the start of a wedge, starting at the corner", () => {
    const stroke = classifyTrace(
      path({ x: 0, y: -20 }, { x: 5, y: 0 }, { x: 105, y: 0 }),
    )
    expect(stroke?.kind).toBe("wedge")
    if (stroke?.kind !== "wedge") return
    expect(stroke.head.x).toBeGreaterThan(2)
    expect(stroke.tail).toEqual({ x: 105, y: 0 })
  })

  it.each([20, 70, 130])("reads a %i° angle as a Winkelhaken", (degrees) => {
    const stroke = classifyTrace(angle(degrees))
    expect(stroke?.kind).toBe("winkelhaken")
    if (stroke?.kind !== "winkelhaken") return
    expect(Math.hypot(stroke.vertex.x, stroke.vertex.y)).toBeLessThan(3)
  })

  it.each([10, 150])("reads a %i° angle as a curved wedge", (degrees) => {
    expect(classifyTrace(angle(degrees))?.kind).toBe("wedge")
  })

  it("accepts a Winkelhaken opening in any direction", () => {
    const opensLeft = angle(70).map((p) => ({ x: -p.x, y: p.y }))
    expect(classifyTrace(opensLeft)?.kind).toBe("winkelhaken")
  })
})

describe("resample", () => {
  it("spaces points evenly and keeps both ends", () => {
    const points = resample(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      3,
    )
    expect(points.map((p) => p.x)).toEqual([0, 3, 6, 9, 10])
  })
})

describe("smooth", () => {
  it("keeps the ends and averages interior points 1-2-1", () => {
    const points = smooth([
      { x: 0, y: 0 },
      { x: 4, y: 4 },
      { x: 8, y: 0 },
    ])
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 2 },
      { x: 8, y: 0 },
    ])
  })
})
