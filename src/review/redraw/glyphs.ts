/**
 * Glyphs read from a font file, in skeleton units.
 */
import { parse, type Font, type Path, type PathCommand } from "opentype.js"

import { boundingBox, type Box, type Point } from "@/lib/geometry"

/** Skeleton units to the em: see docs/skeleton-format.md. */
const EM = 100

/**
 * A glyph's outline at 1 em = 100, with the origin on the baseline at the
 * glyph's origin, and y pointing down, as strokes are drawn.
 */
export interface Glyph {
  readonly path: Path
  /** A box that holds the outline, though not always tightly around curves. */
  readonly box: Box
}

/** Reads a font file, such as a TTF. */
export function readFont(bytes: ArrayBuffer): Font {
  return parse(bytes)
}

/** The glyph the font draws for `text`, or undefined if it has none. */
export function glyph(font: Font, text: string): Glyph | undefined {
  if ([...text].length === 1 && font.charToGlyphIndex(text) === 0) {
    return undefined
  }
  const path = font.getPath(text, 0, 0, EM, { kerning: false })
  if (path.commands.length === 0) return undefined
  return { path, box: boundingBox(path.commands.flatMap(points)) }
}

/** The characters the font has a glyph for, in code point order. */
export function fontCharacters(font: Font): string[] {
  const codePoints = Array.from(
    { length: font.glyphs.length },
    (_, i) => font.glyphs.get(i).unicodes,
  ).flat()
  return codePoints
    .toSorted((a, b) => a - b)
    .map((cp) => String.fromCodePoint(cp))
}

/**
 * A path command's points, curves' control points included: a curve lies
 * within the outline of its points, so they make a safe box around it.
 */
function points(command: PathCommand): Point[] {
  switch (command.type) {
    case "M": // Move to
    case "L": // Line to
      return [command]
    case "Q": // Quadratic curve
      return [command, { x: command.x1, y: command.y1 }]
    case "C": // Cubic curve
      return [
        command,
        { x: command.x1, y: command.y1 },
        { x: command.x2, y: command.y2 },
      ]
    case "Z": // Close
      return []
  }
}
