import { describe, expect, it } from "vitest"

import type { StrokeFeature } from "./features"
import { normalize } from "./normalize"

describe("normalize", () => {
  it("centres the key points' bounding box and scales its longer side to 1", () => {
    const features: StrokeFeature[] = [
      {
        kind: "wedge",
        position: { x: 20, y: 20 },
        angle: 0,
        logLength: Math.log(20),
      },
      {
        kind: "winkelhaken",
        position: { x: 20, y: 25 },
        logSize: Math.log(5),
        opening: 0,
      },
    ]
    const keyPoints = [
      { x: 10, y: 20 },
      { x: 30, y: 20 },
      { x: 20, y: 25 },
      { x: 25, y: 22 },
      { x: 25, y: 28 },
    ]

    const [wedge, winkelhaken] = normalize(features, keyPoints)
    expect(wedge).toEqual({
      kind: "wedge",
      position: { x: 0, y: -0.2 },
      angle: 0,
      logLength: expect.closeTo(Math.log(1)) as number,
    })
    expect(winkelhaken).toEqual({
      kind: "winkelhaken",
      position: { x: 0, y: 0.05 },
      logSize: expect.closeTo(Math.log(0.25)) as number,
      opening: 0,
    })
  })

  it("leaves a single point at the origin", () => {
    const point = { x: 3, y: 3 }
    const [wedge] = normalize(
      [{ kind: "wedge", position: point, angle: 0, logLength: 0 }],
      [point],
    )
    expect(wedge?.position).toEqual({ x: 0, y: 0 })
  })
})
