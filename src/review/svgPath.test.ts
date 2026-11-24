import { describe, expect, it } from "vitest"

import { svgPath } from "./svgPath"

describe("svgPath", () => {
  it("closes each polygon", () => {
    const square = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ]
    expect(svgPath([square, square])).toBe("M0 0L1 0L1 1ZM0 0L1 0L1 1Z")
  })

  it("rounds to two decimal places", () => {
    expect(svgPath([[{ x: 1 / 3, y: -2 / 3 }]])).toBe("M0.33 -0.67Z")
  })
})
