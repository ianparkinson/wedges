import { describe, expect, it } from "vitest"

import { parseShape, prepareSkeleton, shapeKeyPoints } from "./skeleton"

/** Rounds coordinates, so that tests can compare them exactly. */
function rounded<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, v: unknown) =>
      typeof v === "number" ? Math.round(v * 1000) / 1000 + 0 : v,
    ),
  ) as T
}

describe("parseShape", () => {
  it("reads a wedge's start, direction, length and head", () => {
    expect(parseShape("w 10 80 270 60 15")).toEqual({
      kind: "wedge",
      start: { x: 10, y: 80 },
      direction: 270,
      length: 60,
      head: 15,
    })
  })

  it("reads a Winkelhaken's vertex, direction and leg", () => {
    expect(parseShape("k 14 32 0 44.5")).toEqual({
      kind: "winkelhaken",
      vertex: { x: 14, y: 32 },
      direction: 0,
      leg: 44.5,
    })
  })

  it("ignores extra whitespace", () => {
    expect(parseShape("  w  0 0   0 10 5 ")).toMatchObject({ length: 10 })
  })

  it.each([
    "x 0 0 0 10",
    "w 0 0 0 10",
    "w 0 0 0 10 5 5",
    "k 0 0 0",
    "w 0 0 0 x 5",
    "",
  ])('rejects "%s"', (shape) => {
    expect(() => parseShape(shape)).toThrow()
  })
})

describe("shapeKeyPoints", () => {
  it("gives a wedge's start and tail end with y flipped downwards", () => {
    expect(
      rounded(shapeKeyPoints(parseShape("w 10 80 270 60 15"), 90)),
    ).toEqual([
      { x: 10, y: -80 },
      { x: 10, y: -20 },
    ])
  })

  it("measures direction anticlockwise from rightwards", () => {
    expect(rounded(shapeKeyPoints(parseShape("w 0 0 90 10 15"), 90))).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: -10 },
    ])
  })

  it("opens a Winkelhaken's legs by the file's angle, either side of its direction", () => {
    const leg = 10 * Math.SQRT1_2
    expect(rounded(shapeKeyPoints(parseShape("k 0 0 0 10"), 90))).toEqual(
      rounded([
        { x: 0, y: 0 },
        { x: leg, y: -leg },
        { x: leg, y: leg },
      ]),
    )
  })
})

describe("prepareSkeleton", () => {
  it("normalises a skeleton's features by the box around its key points", () => {
    // A horizontal wedge 100 long, and a Winkelhaken at its start.
    const sample = prepareSkeleton(
      [parseShape("w 0 50 0 100 15"), parseShape("k 0 50 0 10")],
      90,
    )
    expect(sample.wedges).toBe(1)
    expect(rounded(sample.features)).toEqual(
      rounded([
        { kind: "wedge", position: { x: 0, y: 0 }, angle: 0, logLength: 0 },
        {
          kind: "winkelhaken",
          position: { x: -0.5, y: 0 },
          logSize: Math.log(0.1),
          opening: 0,
        },
      ]),
    )
  })

  it("turns directions into the drawing frame, where y points down", () => {
    const sample = prepareSkeleton([parseShape("w 0 100 270 100 15")], 90)
    expect(sample.features[0]).toMatchObject({
      angle: expect.closeTo(Math.PI / 2) as number,
    })
  })
})
