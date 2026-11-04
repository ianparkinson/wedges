import { describe, expect, it } from "vitest"

import { normalize } from "./normalize"

describe("normalize", () => {
  it("centres the bounding box and scales its longer side to 1", () => {
    expect(
      normalize([
        { kind: "wedge", head: { x: 10, y: 20 }, tail: { x: 30, y: 20 } },
        {
          kind: "winkelhaken",
          vertex: { x: 20, y: 25 },
          legA: { x: 25, y: 22 },
          legB: { x: 25, y: 28 },
        },
      ]),
    ).toEqual([
      { kind: "wedge", head: { x: -0.5, y: -0.2 }, tail: { x: 0.5, y: -0.2 } },
      {
        kind: "winkelhaken",
        vertex: { x: 0, y: 0.05 },
        legA: { x: 0.25, y: -0.1 },
        legB: { x: 0.25, y: 0.2 },
      },
    ])
  })

  it("leaves a single point at the origin", () => {
    const point = { x: 3, y: 3 }
    expect(normalize([{ kind: "wedge", head: point, tail: point }])).toEqual([
      { kind: "wedge", head: { x: 0, y: 0 }, tail: { x: 0, y: 0 } },
    ])
  })
})
