/**
 * A tiny font for tests of code that reads glyphs, built in memory.
 */
import { Font, Glyph, Path } from "opentype.js"

/**
 * A font of 1000 units to the em with a square for A, a bowl for B, and a
 * vertical bar for 𒁹 (DIŠ, U+12079).
 */
export function testFont(): Font {
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

  const bar = new Path()
  bar.moveTo(200, 0)
  bar.lineTo(200, 700)
  bar.lineTo(240, 700)
  bar.lineTo(240, 0)
  bar.close()

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
      glyph("DIS", 0x12079, bar),
    ],
  })
}
