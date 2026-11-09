import { describe, expect, it } from "vitest"

import { distance, type Point } from "./geometry"
import type { Wedge, Winkelhaken } from "./strokes"
import { tidyStroke } from "./tidyStroke"

const DEGREE = Math.PI / 180
const noSnap = 0
const snap10 = 10 * DEGREE

function wedge(head: Point, tail: Point): Wedge {
  return { kind: "wedge", head, tail }
}

function winkelhaken(vertex: Point, legA: Point, legB: Point): Winkelhaken {
  return { kind: "winkelhaken", vertex, legA, legB }
}

/** The point `length` from `origin` at `degrees` clockwise from the x axis. */
function polar(origin: Point, degrees: number, length: number): Point {
  return {
    x: origin.x + length * Math.cos(degrees * DEGREE),
    y: origin.y + length * Math.sin(degrees * DEGREE),
  }
}

function expectPoint(actual: Point, expected: Point) {
  expect(actual.x).toBeCloseTo(expected.x)
  expect(actual.y).toBeCloseTo(expected.y)
}

describe("tidyStroke of a Winkelhaken", () => {
  const vertex = { x: 50, y: 50 }

  it("makes both legs the mean of their lengths", () => {
    const tidy = tidyStroke(
      winkelhaken(vertex, polar(vertex, -40, 20), polar(vertex, 40, 40)),
      noSnap,
    ) as Winkelhaken
    expect(distance(tidy.vertex, tidy.legA)).toBeCloseTo(30)
    expect(distance(tidy.vertex, tidy.legB)).toBeCloseTo(30)
  })

  it("keeps the vertex and the directions of the legs", () => {
    const tidy = tidyStroke(
      winkelhaken(vertex, polar(vertex, -40, 20), polar(vertex, 40, 40)),
      noSnap,
    ) as Winkelhaken
    expect(tidy.vertex).toEqual(vertex)
    expectPoint(tidy.legA, polar(vertex, -40, 30))
    expectPoint(tidy.legB, polar(vertex, 40, 30))
  })

  it("turns about its vertex to point straight when nearly so", () => {
    // Legs at -35° and 45° make a bisector at 5°.
    const tidy = tidyStroke(
      winkelhaken(vertex, polar(vertex, -35, 30), polar(vertex, 45, 30)),
      snap10,
    ) as Winkelhaken
    expectPoint(tidy.legA, polar(vertex, -40, 30))
    expectPoint(tidy.legB, polar(vertex, 40, 30))
  })

  it("finds its bisector when the legs lie either side of the -x axis", () => {
    // Legs at 140° and -136° (224°) make a bisector at 182°.
    const tidy = tidyStroke(
      winkelhaken(vertex, polar(vertex, 140, 30), polar(vertex, -136, 30)),
      snap10,
    ) as Winkelhaken
    expectPoint(tidy.legA, polar(vertex, 138, 30))
    expectPoint(tidy.legB, polar(vertex, 222, 30))
  })

  it("is left pointing its own way when far from a snapping direction", () => {
    // Legs at -20° and 60° make a bisector at 20°.
    const legA = polar(vertex, -20, 30)
    const legB = polar(vertex, 60, 30)
    const tidy = tidyStroke(
      winkelhaken(vertex, legA, legB),
      snap10,
    ) as Winkelhaken
    expectPoint(tidy.legA, legA)
    expectPoint(tidy.legB, legB)
  })
})

describe("tidyStroke of a wedge", () => {
  it("is left alone when not snapping", () => {
    const drawn = wedge({ x: 0, y: 0 }, { x: 100, y: 8 })
    expect(tidyStroke(drawn, noSnap)).toEqual(drawn)
  })

  it("turns about its midpoint to lie horizontal when nearly so", () => {
    const tidy = tidyStroke(
      wedge({ x: 0, y: 0 }, polar({ x: 0, y: 0 }, 6, 100)),
      snap10,
    ) as Wedge
    const middle = polar({ x: 0, y: 0 }, 6, 50)
    expectPoint(tidy.head, { x: middle.x - 50, y: middle.y })
    expectPoint(tidy.tail, { x: middle.x + 50, y: middle.y })
  })

  it("snaps to a diagonal, whichever way it was drawn", () => {
    const head = { x: 100, y: 100 }
    const tidy = tidyStroke(wedge(head, polar(head, -128, 60)), snap10) as Wedge
    const turned = tidy.tail
    expect(
      Math.atan2(turned.y - tidy.head.y, turned.x - tidy.head.x),
    ).toBeCloseTo(-135 * DEGREE)
    expect(distance(tidy.head, tidy.tail)).toBeCloseTo(60)
  })

  it("is left alone when further than the tolerance from a snapping direction", () => {
    const drawn = wedge({ x: 0, y: 0 }, polar({ x: 0, y: 0 }, 20, 100))
    expect(tidyStroke(drawn, snap10)).toEqual(drawn)
  })
})
