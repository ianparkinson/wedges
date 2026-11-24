import { describe, expect, it } from "vitest"

import { testFont } from "@test/testFont"

import { changedGlyphs, compareSigns, isChanged } from "./compare"
import type { ReviewSign } from "./reviewSigns"

function sign(key: string, shapes?: string[]): ReviewSign {
  const text = key.split("#")[0]!
  return { key, text, group: "simple", block: "main", shapes }
}

describe("compareSigns", () => {
  it("pairs each sign with the one with the same key before", () => {
    const [a] = compareSigns(
      [sign("𒀀#0", ["w 1 2 0 3 4"])],
      [sign("𒀀#0", ["w 1 2 0 5 4"])],
      new Set(),
    )
    expect(a?.before?.shapes).toEqual(["w 1 2 0 5 4"])
    expect(a && isChanged(a)).toBe(true)
  })

  it("keeps entries only the earlier version had, with no shapes now", () => {
    const signs = compareSigns([], [sign("𒀀#1", ["w 1 2 0 3 4"])], new Set())
    expect(signs.map((r) => [r.key, r.shapes, r.before?.shapes])).toEqual([
      ["𒀀#1", undefined, ["w 1 2 0 3 4"]],
    ])
  })

  it("marks the glyphs the fonts draw differently", () => {
    const [a] = compareSigns(
      [sign("𒀀#0", ["w 1 2 0 3 4"])],
      [sign("𒀀#0", ["w 1 2 0 3 4"])],
      new Set(["𒀀"]),
    )
    expect(a?.before?.glyphChanged).toBe(true)
    expect(a && isChanged(a)).toBe(true)
  })
})

describe("isChanged", () => {
  it("is false for an unchanged sign, or when not comparing", () => {
    const [same] = compareSigns(
      [sign("𒀀#0", ["w 1 2 0 3 4"])],
      [sign("𒀀#0", ["w 1 2 0 3 4"])],
      new Set(),
    )
    expect(same && isChanged(same)).toBe(false)
    expect(isChanged(sign("𒀀#0", ["w 1 2 0 3 4"]))).toBe(false)
  })

  it("is true for a sign traced since", () => {
    const [traced] = compareSigns(
      [sign("𒀀#0", ["w 1 2 0 3 4"])],
      [sign("𒀀#0")],
      new Set(),
    )
    expect(traced && isChanged(traced)).toBe(true)
  })
})

describe("changedGlyphs", () => {
  it("finds the cuneiform glyphs whose outlines differ", () => {
    expect(changedGlyphs(testFont(), testFont(60))).toEqual(new Set(["𒁹"]))
  })

  it("finds none between fonts with the same outlines", () => {
    expect(changedGlyphs(testFont(), testFont())).toEqual(new Set())
  })
})
