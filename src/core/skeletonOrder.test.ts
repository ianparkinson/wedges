import { describe, expect, it } from "vitest"

import { compareShapes, compareTexts, sortSkeletonFile } from "./skeletonOrder"
import type { SkeletonFile } from "./types"

describe("compareTexts", () => {
  it("compares code points, which put U+E000 before U+12000", () => {
    const texts = ["𒀀", "\uE000"]
    expect(texts.toSorted(compareTexts)).toEqual(["\uE000", "𒀀"])
  })

  it("puts a sign before the ligatures that start with it", () => {
    const texts = ["𒌋𒌋", "𒌋"]
    expect(texts.toSorted(compareTexts)).toEqual(["𒌋", "𒌋𒌋"])
  })
})

describe("compareShapes", () => {
  it("orders by x, then y", () => {
    const shapes = ["w 30 10 0 20 15", "w 20 50 0 20 15", "w 20 40 0 20 15"]
    expect(shapes.toSorted(compareShapes)).toEqual([
      "w 20 40 0 20 15",
      "w 20 50 0 20 15",
      "w 30 10 0 20 15",
    ])
  })

  it("compares numbers as numbers, not as text", () => {
    const shapes = ["w 100 10 0 20 15", "w 9 10 0 20 15"]
    expect(shapes.toSorted(compareShapes)).toEqual([
      "w 9 10 0 20 15",
      "w 100 10 0 20 15",
    ])
  })

  it("then orders by op, then the remaining numbers", () => {
    const shapes = ["w 20 40 90 20 15", "w 20 40 0 20 15", "k 20 40 0 18"]
    expect(shapes.toSorted(compareShapes)).toEqual([
      "k 20 40 0 18",
      "w 20 40 0 20 15",
      "w 20 40 90 20 15",
    ])
  })

  it("puts a Winkelhaken without its own angle before one with it", () => {
    const shapes = ["k 20 40 0 18 92", "k 20 40 0 18"]
    expect(shapes.toSorted(compareShapes)).toEqual([
      "k 20 40 0 18",
      "k 20 40 0 18 92",
    ])
  })
})

describe("sortSkeletonFile", () => {
  const file: SkeletonFile = {
    version: 2,
    font: { family: "Test", version: "1", unitsPerEm: 1000, sha256: "00" },
    wedges: "tapered",
    headLean: 0,
    winkelhakenAngle: 105,
    skeletons: [
      { text: "𒀭", shapes: ["w 50 50 0 20 15", "w 10 50 0 20 15"] },
      { text: "𒀀", comments: "first" },
      { text: "𒀀", shapes: ["w 10 10 270 30 15"] },
    ],
  }

  it("sorts entries by text, keeping the file order of equal texts", () => {
    const sorted = sortSkeletonFile(file).skeletons.map((e) => e.comments)
    expect(sorted).toEqual(["first", undefined, undefined])
  })

  it("sorts each entry's shapes", () => {
    expect(sortSkeletonFile(file).skeletons[2]?.shapes).toEqual([
      "w 10 50 0 20 15",
      "w 50 50 0 20 15",
    ])
  })

  it("keeps the header as it is", () => {
    expect({ ...sortSkeletonFile(file), skeletons: [] }).toEqual({
      ...file,
      skeletons: [],
    })
  })
})
