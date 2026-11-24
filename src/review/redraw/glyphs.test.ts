import { Font, Glyph, Path } from "opentype.js"
import { describe, expect, it } from "vitest"

import { fontCharacters, glyph } from "./glyphs"

/** A font of 1000 units to the em with a square for A and a bowl for B. */
function testFont(): Font {
  const square = new Path()
  square.moveTo(100, 0)
  square.lineTo(100, 500)
  square.lineTo(600, 500)
  square.lineTo(600, 0)
  square.close()

  const bowl = new Path()
  bowl.moveTo(0, 500)
  bowl.quadraticCurveTo(500, -500, 1000, 500)
  bowl.close()

  const glyph = (name: string, unicode: number, path: Path) =>
    new Glyph({ name, unicode, advanceWidth: 1000, path })
  return new Font({
    familyName: "Test",
    styleName: "Regular",
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    glyphs: [
      new Glyph({ name: ".notdef", advanceWidth: 1000, path: new Path() }),
      glyph("A", 65, square),
      glyph("B", 66, bowl),
    ],
  })
}

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
    expect(fontCharacters(testFont())).toEqual(["A", "B"])
  })
})
