import { describe, expect, it } from "vitest"

import type { Box } from "@/core/geometry"

import { nearestBoundary } from "./nearestBoundary"

/** A box 40 pixels wide and 50 tall, at column `column` of row `row`. */
function box(row: number, column: number): Box {
  return {
    left: column * 40,
    right: (column + 1) * 40,
    top: row * 50,
    bottom: (row + 1) * 50,
  }
}

/** Three boxes on the first row, then two on the second. */
const twoRows = [box(0, 0), box(0, 1), box(0, 2), box(1, 0), box(1, 1)]

describe("nearestBoundary", () => {
  it("puts a point in the left half of a box before it", () => {
    expect(nearestBoundary(twoRows, { x: 45, y: 25 })).toBe(1)
  })

  it("puts a point in the right half of a box after it", () => {
    expect(nearestBoundary(twoRows, { x: 75, y: 25 })).toBe(2)
  })

  it("puts a point at the far left before the first box, the start", () => {
    expect(nearestBoundary(twoRows, { x: 5, y: 25 })).toBe(0)
  })

  it("puts a point past the end of a row after its last box", () => {
    expect(nearestBoundary(twoRows, { x: 300, y: 25 })).toBe(3)
  })

  it("puts a point past the end of the last row at the end", () => {
    expect(nearestBoundary(twoRows, { x: 300, y: 75 })).toBe(5)
  })

  it("puts a point below every row in the last row", () => {
    expect(nearestBoundary(twoRows, { x: 5, y: 500 })).toBe(3)
  })

  it("gives the start when there are no boxes", () => {
    expect(nearestBoundary([], { x: 10, y: 10 })).toBe(0)
  })
})
