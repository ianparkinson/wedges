/**
 * Comparing two versions of a skeleton file, or of its font: which signs
 * have changed, and how they were before.
 */
import type { Font } from "opentype.js"

import { glyph } from "./redraw/glyphs"
import { cuneiformCharacters, type ReviewSign } from "./reviewSigns"

/**
 * The signs of the current version, each with how it was in the version
 * compared with, followed by any entries only that version has. Signs are
 * matched by key, and `changedGlyphs` holds the characters whose glyph the
 * fonts draw differently.
 */
export function compareSigns(
  signs: readonly ReviewSign[],
  beforeSigns: readonly ReviewSign[],
  changedGlyphs: ReadonlySet<string>,
): ReviewSign[] {
  const beforeByKey = new Map(beforeSigns.map((sign) => [sign.key, sign]))
  const keys = new Set(signs.map((sign) => sign.key))
  const gone = beforeSigns
    .filter((sign) => !keys.has(sign.key))
    .map(({ key, text, name, group, block }) => ({
      key,
      text,
      name,
      group,
      block,
    }))

  return [...signs, ...gone].map((sign) => {
    const before = beforeByKey.get(sign.key)
    return {
      ...sign,
      before: {
        shapes: before?.shapes,
        glyphChanged: changedGlyphs.has(sign.text),
      },
    }
  })
}

/** Whether a sign's skeleton or glyph differs from the version compared with. */
export function isChanged(sign: ReviewSign): boolean {
  const before = sign.before
  if (!before) return false
  return before.glyphChanged || !sameShapes(before.shapes, sign.shapes)
}

/**
 * The cuneiform characters whose glyphs differ between two fonts, including
 * those only one of them has.
 */
export function changedGlyphs(before: Font, after: Font): Set<string> {
  if (before === after) return new Set()
  const characters = new Set([
    ...cuneiformCharacters(before),
    ...cuneiformCharacters(after),
  ])
  return new Set(
    [...characters].filter((c) => outline(before, c) !== outline(after, c)),
  )
}

function sameShapes(
  a: readonly string[] | undefined,
  b: readonly string[] | undefined,
): boolean {
  return a?.join("|") === b?.join("|")
}

/** A glyph's outline as SVG path data, or "" if the font has no glyph. */
function outline(font: Font, text: string): string {
  return glyph(font, text)?.path.toPathData(2) ?? ""
}
