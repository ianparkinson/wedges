/**
 * The sign database: the skeletons joined with the Oracc Sign List data, by
 * character. It is the one place features ask about signs.
 */
import type { LookupEntry } from "./lookup"
import { prepareSample, type PreparedSample } from "./matcher/match"
import { parseSpec } from "./spec"
import type { OslData, OslSequence, OslSign, SkeletonFile } from "./types"

/** A sign, with the samples to match drawings against, if it has any. */
export interface Sign extends OslSign {
  readonly samples: readonly PreparedSample[]
}

/** A sequence of signs with readings of its own, such as |PA.TE.SI|, read ensi₂. */
export type Sequence = OslSequence

const OSL_PAGE = "https://oracc.museum.upenn.edu/osl/"

/** The sign's page in the Oracc Sign List. */
export function oslUrl(entry: { readonly oslId: string }): string {
  return OSL_PAGE + entry.oslId
}

/** A character's Unicode code point, written as U+ and hexadecimal: 𒀭 is U+1202D. */
export function codePoint(char: string): string {
  const hex = (char.codePointAt(0) ?? 0).toString(16).toUpperCase()
  return "U+" + hex.padStart(4, "0")
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
  private readonly byChar: ReadonlyMap<string, Sign>
  private readonly sequenceByChars: ReadonlyMap<string, Sequence>
  private cachedLookupEntries: readonly LookupEntry[] | undefined

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
      samples: samples.get(sign.char) ?? [],
    }))
    this.byChar = new Map(this.signs.map((s) => [s.char, s]))
    this.drawable = [...samples.keys()]
      .map((char) => this.byChar.get(char))
      .filter((sign) => sign !== undefined)

    this.sequences = osl.sequences
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

  /** The sequence with these characters, if the Oracc data lists one. */
  sequence(chars: string): Sequence | undefined {
    return this.sequenceByChars.get(chars)
  }

  /** Signs and sequences for the lookup index, built on first use. */
  get lookupEntries(): readonly LookupEntry[] {
    this.cachedLookupEntries ??= [
      ...this.signs.map((s) => ({
        kind: "sign" as const,
        chars: s.char,
        names: lookupNames(s),
        values: s.values,
      })),
      ...this.sequences.map((s) => ({
        kind: "sequence" as const,
        chars: s.chars,
        names: [s.name],
        values: s.values,
      })),
    ]
    return this.cachedLookupEntries
  }
}

/** The sign's OSL name, then its short Unicode name if that differs. */
function lookupNames(sign: Sign): string[] {
  const unicode = sign.unicodeName && shortUnicodeName(sign.unicodeName)
  return unicode && unicode !== sign.name ? [sign.name, unicode] : [sign.name]
}

/**
 * A Unicode name without its common prefix: CUNEIFORM SIGN GA2 TIMES AN is
 * GA2 TIMES AN, and CUNEIFORM NUMERIC SIGN THREE ASH is THREE ASH.
 */
export function shortUnicodeName(name: string): string {
  return name.replace(/^CUNEIFORM (?:NUMERIC |PUNCTUATION )?SIGN /, "")
}
