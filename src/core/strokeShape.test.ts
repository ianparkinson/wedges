import { describe, expect, it } from "vitest"

import { segmentDistance } from "@/lib/geometry"

import type { Wedge, Winkelhaken } from "./strokes"
import { strokeOutline } from "./strokeShape"

/** A vertical wedge drawn downwards from the origin. */
function verticalWedge(length: number): Wedge {
  return { kind: "wedge", head: { x: 0, y: 0 }, tail: { x: 0, y: length } }
}

describe("strokeOutline of a wedge", () => {
  it("comes to a point at the tail", () => {
    expect(strokeOutline(verticalWedge(100), 20)).toContainEqual({
      x: 0,
      y: 100,
    })
  })

  it("is widest across the head, the same distance either side", () => {
    const [left, , , , right] = strokeOutline(verticalWedge(100), 20)
    expect(left!.y).toBe(0)
    expect(right!.y).toBe(0)
    expect(left!.x).toBeCloseTo(-right!.x)
    expect(Math.abs(left!.x)).toBeGreaterThan(0)
  })

  it("gives a long wedge a head of the size asked for", () => {
    const [, neck] = strokeOutline(verticalWedge(100), 20)
    expect(neck!.y).toBeCloseTo(20)
  })

  it("shrinks the head of a short wedge, so it keeps a tail", () => {
    const [, neck] = strokeOutline(verticalWedge(30), 20)
    expect(neck!.y).toBeCloseTo(12)
  })

  it("lies along the wedge, whichever way it was drawn", () => {
    const wedge: Wedge = {
      kind: "wedge",
      head: { x: 50, y: 50 },
      tail: { x: 10, y: 20 },
    }
    for (const point of strokeOutline(wedge, 10)) {
      expect(segmentDistance(point, wedge.head, wedge.tail)).toBeLessThan(5)
    }
  })
})

describe("strokeOutline of a Winkelhaken", () => {
  const winkelhaken: Winkelhaken = {
    kind: "winkelhaken",
    vertex: { x: 0, y: 0 },
    legA: { x: 40, y: -30 },
    legB: { x: 40, y: 30 },
  }

  it("runs from the vertex to the end of each leg", () => {
    const outline = strokeOutline(winkelhaken, 20)
    expect(outline).toContainEqual(winkelhaken.vertex)
    expect(outline).toContainEqual(winkelhaken.legA)
    expect(outline).toContainEqual(winkelhaken.legB)
  })

  it("is notched between the legs, short of the vertex", () => {
    const [, , notch] = strokeOutline(winkelhaken, 20)
    expect(notch!.y).toBeCloseTo(0)
    expect(notch!.x).toBeGreaterThan(0)
    expect(notch!.x).toBeLessThan(40)
  })
})
