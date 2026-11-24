import { describe, expect, it } from "vitest"

import { testFont } from "@test/testFont"

import { fontCharacters, glyph } from "./glyphs"

describe("glyph", () => {
  it("scales to 100 units to the em, with y pointing down from the baseline", () => {
    expect(glyph(testFont(), "A")?.box).toEqual({
      left: 10,
      right: 60,
      top: -50,
      bottom: 0,
    })
  })

  it("keeps curves, inside its box", () => {
    const bowl = glyph(testFont(), "B")!
    expect(bowl.path.commands.map((c) => c.type)).toContain("Q")
    expect(bowl.box.top).toBe(-50)
    expect(bowl.box.bottom).toBeGreaterThanOrEqual(0)
  })

  it("is undefined for a character the font has no glyph for", () => {
    expect(glyph(testFont(), "C")).toBeUndefined()
  })
})

describe("fontCharacters", () => {
  it("lists the characters the font has glyphs for, in order", () => {
    expect(fontCharacters(testFont())).toEqual(["A", "B", "𒁹"])
  })
})
