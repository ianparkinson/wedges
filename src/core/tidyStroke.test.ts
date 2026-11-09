import { describe, expect, it } from "vitest"

import { distance, type Point } from "./geometry"
import type { Wedge, Winkelhaken } from "./strokes"
import { tidyStroke } from "./tidyStroke"

const DEGREE = Math.PI / 180

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
    ) as Winkelhaken
    expect(distance(tidy.vertex, tidy.legA)).toBeCloseTo(30)
    expect(distance(tidy.vertex, tidy.legB)).toBeCloseTo(30)
  })

  it("keeps the vertex and the directions of the legs", () => {
    const tidy = tidyStroke(
      winkelhaken(vertex, polar(vertex, -40, 20), polar(vertex, 40, 40)),
    ) as Winkelhaken
    expect(tidy.vertex).toEqual(vertex)
    expectPoint(tidy.legA, polar(vertex, -40, 30))
    expectPoint(tidy.legB, polar(vertex, 40, 30))
  })
})

describe("tidyStroke of a wedge", () => {
  it("leaves it as drawn", () => {
    const drawn: Wedge = {
      kind: "wedge",
      head: { x: 0, y: 0 },
      tail: { x: 100, y: 8 },
    }
    expect(tidyStroke(drawn)).toEqual(drawn)
  })
})
