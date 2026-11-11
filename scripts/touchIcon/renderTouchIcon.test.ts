import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

import { renderTouchIcon, TOUCH_ICON_SIZE } from "./renderTouchIcon.ts"

// Vitest runs from the repository root.
const favicon = readFileSync("public/favicon.svg", "utf8")

/** The colour of one pixel: its red, green and blue as hex digits, and its alpha. */
function colourAt(
  image: ReturnType<typeof renderTouchIcon>,
  x: number,
  y: number,
) {
  const i = 4 * (y * image.width + x)
  const [r, g, b, a] = image.pixels.subarray(i, i + 4)
  return {
    hex: [r, g, b].map((c) => c!.toString(16).padStart(2, "0")).join(""),
    alpha: a,
  }
}

describe("renderTouchIcon", () => {
  it("renders the favicon at the size Apple asks for", () => {
    const icon = renderTouchIcon(favicon)
    expect([icon.width, icon.height]).toEqual([
      TOUCH_ICON_SIZE,
      TOUCH_ICON_SIZE,
    ])
  })

  it("fills its corners with the favicon's clay, since iOS rounds them itself", () => {
    const icon = renderTouchIcon(favicon)
    const last = TOUCH_ICON_SIZE - 1
    for (const [x, y] of [
      [0, 0],
      [last, 0],
      [0, last],
      [last, last],
    ] as const) {
      expect(colourAt(icon, x, y)).toEqual({ hex: "e4d3b4", alpha: 255 })
    }
  })

  it("draws AN's wedges where they cross, in the middle", () => {
    const icon = renderTouchIcon(favicon)
    const middle = TOUCH_ICON_SIZE / 2
    expect(colourAt(icon, middle, middle).hex).toBe("5a3f28")
  })
})
