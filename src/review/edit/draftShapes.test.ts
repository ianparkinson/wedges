import { describe, expect, it } from "vitest"

import { draftShapes } from "./draftShapes"

describe("draftShapes", () => {
  it("reads a shape from each line, skipping blank lines", () => {
    expect(draftShapes("w 22 70 270 70 4\n\n  k 10  20 0 14 \n")).toEqual({
      shapes: ["w 22 70 270 70 4", "k 10 20 0 14"],
      problems: [],
    })
  })

  it("names each line that isn't a shape", () => {
    expect(draftShapes("w 22 70 270 70 4\nw 1 2\nx 1 2 3 4 5")).toEqual({
      shapes: ["w 22 70 270 70 4"],
      problems: ["Line 2: w 1 2", "Line 3: x 1 2 3 4 5"],
    })
  })
})
