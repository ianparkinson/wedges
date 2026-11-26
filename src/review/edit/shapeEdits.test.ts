import { describe, expect, it } from "vitest"

import {
  parseShape,
  type WedgeShape,
  type WinkelhakenShape,
} from "@/core/skeleton"

import {
  formatShape,
  lengthenShape,
  moveShape,
  openWinkelhaken,
  pointShape,
  shapeHandles,
  snapDirection,
  traceLeg,
  turnShape,
  widenHead,
} from "./shapeEdits"

const wedge = parseShape("w 10 50 0 30 12") as WedgeShape
const winkelhaken = parseShape("k 10 50 0 14") as WinkelhakenShape
const edited = (shape: Parameters<typeof formatShape>[0]) => formatShape(shape)

describe("formatShape", () => {
  it("writes shapes as parseShape reads them", () => {
    for (const text of [
      "w 21 69 270 77 15",
      "k 58 51 0 14",
      "k 58 51 0 14 84",
    ]) {
      expect(formatShape(parseShape(text))).toBe(text)
    }
  })
})

describe("moveShape", () => {
  it("moves the start to whole units", () => {
    expect(edited(moveShape(wedge, 2.4, -3.6))).toBe("w 12 46 0 30 12")
    expect(edited(moveShape(winkelhaken, 1, 1))).toBe("k 11 51 0 14")
  })
})

describe("pointShape", () => {
  it("points a wedge's tail at a point, in the file's frame where y is up", () => {
    expect(edited(pointShape(wedge, { x: 10, y: 10 }, false))).toBe(
      "w 10 50 270 40 12",
    )
  })

  it("snaps a direction near a multiple of 45° unless asked not to", () => {
    const nearlyDown = { x: 14, y: 10 }
    expect(edited(pointShape(wedge, nearlyDown, true))).toBe(
      "w 10 50 270 40 12",
    )
    expect(edited(pointShape(wedge, nearlyDown, false))).toBe(
      "w 10 50 276 40 12",
    )
  })

  it("opens a Winkelhaken towards a point, with legs reaching it", () => {
    expect(edited(pointShape(winkelhaken, { x: 10, y: 70 }, true))).toBe(
      "k 10 50 90 20",
    )
  })
})

describe("widenHead", () => {
  it("makes the head twice as wide as the point is off the tail's line", () => {
    expect(edited(widenHead(wedge, { x: 15, y: 41 }))).toBe("w 10 50 0 30 18")
  })
})

/** The point `length` from the Winkelhaken's vertex, `degrees` anticlockwise of rightwards. */
const fromVertex = (degrees: number, length = 14) => ({
  x: 10 + length * Math.cos((degrees * Math.PI) / 180),
  y: 50 + length * Math.sin((degrees * Math.PI) / 180),
})

describe("traceLeg", () => {
  it("opens to the clockwise side of the traced leg, or the other with mirror", () => {
    expect(edited(traceLeg(winkelhaken, fromVertex(90, 20), 100, false))).toBe(
      "k 10 50 40 20",
    )
    expect(
      edited(traceLeg(winkelhaken, fromVertex(90, 20), 100, false, true)),
    ).toBe("k 10 50 140 20")
  })

  it("keeps the Winkelhaken's own angle, and snaps where it opens", () => {
    const own = { ...winkelhaken, angle: 92 }
    expect(edited(traceLeg(own, fromVertex(90), 100, true))).toBe(
      "k 10 50 45 14 92",
    )
  })
})

describe("openWinkelhaken", () => {
  it("swings the other leg, keeping the traced one where it is", () => {
    // The traced leg is at 50°, half of 100° anticlockwise of the opening.
    expect(
      edited(openWinkelhaken(winkelhaken, fromVertex(-70), 100, true)),
    ).toBe("k 10 50 350 14 120")
  })

  it("takes the file's angle when it's close, unless asked not to snap", () => {
    expect(
      edited(openWinkelhaken(winkelhaken, fromVertex(-52), 100, true)),
    ).toBe("k 10 50 0 14")
    expect(
      edited(openWinkelhaken(winkelhaken, fromVertex(-52), 100, false)),
    ).toBe("k 10 50 359 14 102")
  })
})

describe("turnShape and lengthenShape", () => {
  it("turn the direction round the circle and change the length", () => {
    expect(edited(turnShape(wedge, -1))).toBe("w 10 50 359 30 12")
    expect(edited(lengthenShape(wedge, 5))).toBe("w 10 50 0 35 12")
    expect(edited(lengthenShape(winkelhaken, -20))).toBe("k 10 50 0 1")
  })
})

describe("snapDirection", () => {
  it("snaps within 7° of a multiple of 45°", () => {
    expect(snapDirection(52)).toBe(45)
    expect(snapDirection(53)).toBe(53)
    expect(snapDirection(-3)).toBe(0)
  })
})

describe("shapeHandles", () => {
  const rounded = (shape: Parameters<typeof shapeHandles>[0]) =>
    shapeHandles(shape, 100).map(({ role, at }) => [
      role,
      Math.round(at.x),
      Math.round(at.y),
    ])

  it("puts a wedge's handles at its tail end and the side of its head", () => {
    expect(rounded(wedge)).toEqual([
      ["point", 40, 50],
      ["head", 10, 56],
    ])
  })

  it("puts a Winkelhaken's handles at the tips of its legs", () => {
    expect(rounded({ ...winkelhaken, angle: 180 })).toEqual([
      ["point", 10, 64],
      ["angle", 10, 36],
    ])
  })
})
