import { describe, expect, it } from "vitest"

import { parseShape } from "@/core/skeleton"

import { dragged, keyed } from "./gestures"
import { formatShape } from "./shapeEdits"

const wedge = parseShape("w 10 50 0 30 12")
const winkelhaken = parseShape("k 10 50 0 14")
const from = { x: 10, y: 50 }
const keys = { snap: true, mirror: false }

describe("dragged", () => {
  it("moves the shape by as far as the drag has gone", () => {
    const shape = dragged("move", wedge, from, { x: 13, y: 45 }, keys, 100)
    expect(formatShape(shape)).toBe("w 13 45 0 30 12")
  })

  it("turns and sizes a Winkelhaken by its traced leg's handle", () => {
    const turned = dragged(
      "point",
      winkelhaken,
      from,
      { x: 10, y: 70 },
      keys,
      100,
    )
    expect(formatShape(turned)).toBe("k 10 50 45 20")
  })

  it("draws a Winkelhaken from the leg traced, on either side with Shift", () => {
    // Along a leg 50° anticlockwise of rightwards, the upper leg of one
    // opening right when the angle between the legs is 100°.
    const tip = {
      x: 10 + 20 * Math.cos((50 * Math.PI) / 180),
      y: 50 + 20 * Math.sin((50 * Math.PI) / 180),
    }
    const mirrored = { snap: true, mirror: true }
    expect(
      formatShape(dragged("draw", winkelhaken, from, tip, keys, 100)),
    ).toBe("k 10 50 0 20")
    expect(
      formatShape(dragged("draw", winkelhaken, from, tip, mirrored, 100)),
    ).toBe("k 10 50 100 20")
  })

  it("leaves a shape alone when dragged by a handle it doesn't have", () => {
    const to = { x: 30, y: 30 }
    expect(dragged("head", winkelhaken, from, to, keys, 100)).toBe(winkelhaken)
    expect(dragged("angle", wedge, from, to, keys, 100)).toBe(wedge)
  })
})

describe("keyed", () => {
  it("moves, turns and lengthens by more with Shift", () => {
    const shapes = [
      keyed(wedge, "ArrowDown", true),
      keyed(wedge, "]", false),
      keyed(wedge, "}", true),
      keyed(winkelhaken, "-", false),
    ]
    expect(shapes.map((s) => formatShape(s!))).toEqual([
      "w 10 45 0 30 12",
      "w 10 50 359 30 12",
      "w 10 50 345 30 12",
      "k 10 50 0 13",
    ])
  })

  it("does nothing for other keys", () => {
    expect(keyed(wedge, "x", false)).toBeUndefined()
  })
})
