/**
 * The sign database: the skeletons joined with the Oracc Sign List data, by
 * character. It is the one place features ask about signs.
 */
import { groupBy } from "@/lib/collections"

import { prepareSample, type PreparedSample } from "./matcher/match"
import { parseSpec } from "./spec"
import {
  COMPOUND_OPERATORS,
  VARIANT_MODIFIERS,
  type OslData,
  type OslSequence,
  type OslSign,
  type SkeletonFile,
  type VariantModifier,
} from "./types"

/** A sign, with the samples to match drawings against, if it has any. */
export interface Sign extends OslSign {
  readonly kind: "sign"
  readonly samples: readonly PreparedSample[]
}

/** A sequence of signs with readings of its own, such as |PA.TE.SI|, read ensi₂. */
export interface Sequence extends OslSequence {
  readonly kind: "sequence"
}

/**
 * Something with an entry of its own in the Oracc Sign List: one sign, or a
 * sequence of signs with readings of its own. Both have a name, values and
 * an OSL page.
 */
export type SignListEntry = Sign | Sequence

/** The characters of a sign or sequence: one for a sign, several for a sequence. */
export function charsOf(listed: SignListEntry): string {
  switch (listed.kind) {
    case "sign":
      return listed.char
    case "sequence":
      return listed.chars
  }
}

const OSL_PAGE = "https://oracc.museum.upenn.edu/osl/"

/** The page of a sign or sequence in the Oracc Sign List. */
export function oslUrl(listed: SignListEntry): string {
  return OSL_PAGE + listed.oslId
}

/** A character's Unicode code point, written as U+ and hexadecimal: 𒀭 is U+1202D. */
export function codePoint(char: string): string {
  const hex = (char.codePointAt(0) ?? 0).toString(16).toUpperCase()
  return "U+" + hex.padStart(4, "0")
}

/** A variant modifier's name: g is gunû, the sign with extra strokes. */
export function modifierName(modifier: VariantModifier): string {
  return VARIANT_MODIFIERS[modifier]
}

/** Every sign and sequence, found by character, with the samples drawings are ranked against. */
export class SignDatabase {
  /** Every sign, in code point order. */
  readonly signs: readonly Sign[]
  /** The signs that have samples, in skeleton file order. */
  readonly drawable: readonly Sign[]
  /** Every sequence the Oracc data lists. */
  readonly sequences: readonly Sequence[]
  /** How many signs the longest sequence has. */
  readonly longestSequence: number
  /** How many parts the compound with the most parts has. */
  readonly mostCompoundParts: number
  private readonly byChar: ReadonlyMap<string, Sign>
  private readonly sequenceByChars: ReadonlyMap<string, Sequence>
  private readonly variantsByBase: ReadonlyMap<string, readonly Sign[]>
  private readonly compoundsByParts: ReadonlyMap<string, readonly Sign[]>

  /**
   * Joins skeleton files with the Oracc data. Skeletons for a character the
   * Oracc data doesn't list are left out; the data tests check there are none.
   */
  constructor(skeletonFiles: readonly SkeletonFile[], osl: OslData) {
    const samples = new Map<string, PreparedSample[]>()
    for (const file of skeletonFiles) {
      for (const { char, spec } of file.skeletons) {
        const list = samples.get(char) ?? []
        list.push(prepareSample(parseSpec(spec)))
        samples.set(char, list)
      }
    }

    this.signs = osl.signs.map((sign) => ({
      ...sign,
      kind: "sign",
      samples: samples.get(sign.char) ?? [],
    }))
    this.byChar = new Map(this.signs.map((s) => [s.char, s]))
    this.drawable = [...samples.keys()]
      .map((char) => this.byChar.get(char))
      .filter((sign) => sign !== undefined)
    this.variantsByBase = groupBy(this.signs, (s) => s.variant?.of)
    const compounds = groupBy(this.signs, (s) => s.compound?.parts.join(""))
    for (const group of compounds.values()) group.sort(byOperator)
    this.compoundsByParts = compounds
    this.mostCompoundParts = Math.max(
      0,
      ...this.signs.map((s) => s.compound?.parts.length ?? 0),
    )

    this.sequences = osl.sequences.map((sequence) => ({
      ...sequence,
      kind: "sequence",
    }))
    this.sequenceByChars = new Map(this.sequences.map((s) => [s.chars, s]))
    // Spreading splits a string into whole characters, each two UTF-16 units.
    this.longestSequence = Math.max(
      0,
      ...this.sequences.map((s) => [...s.chars].length),
    )
  }

  /** The sign for a character, if it is in the Oracc data. */
  sign(char: string): Sign | undefined {
    return this.byChar.get(char)
  }

  /** The variants of a sign, such as LAGAR@g for LAGAR, in code point order. */
  variants(char: string): readonly Sign[] {
    return this.variantsByBase.get(char) ?? []
  }

  /**
   * The compounds made of these parts, in this order, such as |GA₂×AN| for
   * GA₂ then AN. Parts can combine in more than one way, as MUŠ and MUŠ do
   * in |MUŠ&MUŠ| and |MUŠ%MUŠ|; × comes first, then &, %, . and +.
   */
  compounds(parts: string): readonly Sign[] {
    return this.compoundsByParts.get(parts) ?? []
  }

  /** The sequence with these characters, if the Oracc data lists one. */
  sequence(chars: string): Sequence | undefined {
    return this.sequenceByChars.get(chars)
  }
}

/** How the database orders the compounds made of the same parts. */
function byOperator(a: Sign, b: Sign): number {
  const rank = (sign: Sign) =>
    COMPOUND_OPERATORS.indexOf(sign.compound?.operator ?? "×")
  return rank(a) - rank(b)
}
