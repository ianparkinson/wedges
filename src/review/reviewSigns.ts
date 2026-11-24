/**
 * The review page's signs: one for each skeleton in a file, and one for each
 * glyph in its font that has none, with what the page sorts and filters by.
 */
import type { Font } from "opentype.js"

import {
  cuneiformBlock,
  isCuneiform,
  type CuneiformBlock,
} from "@/core/cuneiform"
import type { OslData, SkeletonFile } from "@/core/types"

import { fontCharacters } from "./redraw/glyphs"
import type { RedrawScore } from "./redraw/redraw"

/** How a sign is made, from its OSL name: see {@link signGroup}. */
export type SignGroup = "simple" | "modified" | "compound" | "unlisted"

/** One glyph, and its skeleton if the file has one. */
export interface ReviewSign {
  /**
   * The characters, then which entry for them this is, counting from 0, as
   * in "𒀀#0". Unique within a file, and the same in any version of it that
   * has as many entries for those characters.
   */
  readonly key: string
  readonly text: string
  /** The OSL name, if OSL lists the characters. */
  readonly name?: string
  readonly group: SignGroup
  /** The Unicode block, or undefined for characters that aren't cuneiform. */
  readonly block?: CuneiformBlock
  /** The skeleton's shapes, or undefined when the file has no entry. */
  readonly shapes?: readonly string[]
  readonly comments?: string
  /**
   * The redraw check's score, for an entry with shapes, once it has been
   * worked out: null if the font has no glyph to score against.
   */
  readonly score?: RedrawScore | null
}

/**
 * Builds the signs for a skeleton file over its font, in file order, then the
 * glyphs with no entry in code point order, all as yet unscored.
 */
export function reviewSigns(
  file: SkeletonFile,
  font: Font,
  osl: OslData,
): ReviewSign[] {
  const names = new Map<string, string>([
    ...osl.signs.map((s) => [s.char, s.name] as const),
    ...osl.sequences.map((s) => [s.chars, s.name] as const),
  ])
  const sign = (text: string, key: string): ReviewSign => {
    const name = names.get(text)
    return {
      key,
      text,
      name,
      group: signGroup(name),
      block: cuneiformBlock(text),
    }
  }

  const seen = new Map<string, number>()
  const entries = file.skeletons.map((entry) => {
    const n = seen.get(entry.text) ?? 0
    seen.set(entry.text, n + 1)
    return {
      ...sign(entry.text, signKey(entry.text, n)),
      shapes: entry.shapes,
      comments: entry.comments,
    }
  })

  const described = new Set(file.skeletons.map((e) => e.text))
  const missing = fontCharacters(font)
    .filter((c) => isCuneiform(c) && !described.has(c))
    .map((c) => sign(c, signKey(c, 0)))

  return [...entries, ...missing]
}

/** A sign's key: see {@link ReviewSign.key}. */
function signKey(text: string, n: number): string {
  return `${text}#${n}`
}

/**
 * How a sign is made, judged from its OSL name: a compound's name is between
 * bars, as in |A×HA|, and a modified sign's has a modifier or variant mark,
 * as in AB@g or ASAL₂~a. Characters OSL doesn't list are "unlisted".
 */
export function signGroup(name: string | undefined): SignGroup {
  if (name === undefined) return "unlisted"
  if (name.includes("|")) return "compound"
  if (/[@~]/.test(name)) return "modified"
  return "simple"
}
