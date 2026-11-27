import type { Font } from "opentype.js"

import type { Box } from "@/lib/geometry"

import { glyph as readGlyph } from "./redraw/glyphs"

/** A glyph's outline as SVG path data, with its box. */
export interface GlyphOutline {
  readonly d: string
  readonly box: Box
}

/**
 * Glyph outlines already worked out, for each font: the page draws each
 * glyph again and again, and turning it into path data takes a while.
 */
const outlines = new WeakMap<Font, Map<string, GlyphOutline | undefined>>()

/**
 * A glyph's outline as SVG path data, in the frame strokes are drawn in, or
 * undefined if the font has no glyph for `text`.
 */
export function glyphOutline(
  font: Font,
  text: string,
): GlyphOutline | undefined {
  let forFont = outlines.get(font)
  if (!forFont) {
    forFont = new Map()
    outlines.set(font, forFont)
  }
  if (!forFont.has(text)) {
    const glyph = readGlyph(font, text)
    forFont.set(text, glyph && { d: glyph.path.toPathData(2), box: glyph.box })
  }
  return forFont.get(text)
}
