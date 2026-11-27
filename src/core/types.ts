/**
 * Types for the data in data/: the skeleton files in data/skeletons, which
 * the data tests check against their JSON Schema, and the sign data built
 * from data/osl.asl. See docs/skeleton-format.md and docs/sign-data.md.
 */

/** data/skeletons/*.json */
export interface SkeletonFile {
  readonly version: 2
  /** The font the skeletons were traced over. */
  readonly font: {
    readonly family: string
    readonly version: string
    readonly unitsPerEm: number
    /** The SHA-256 hash of the font file, in lowercase hex. */
    readonly sha256: string
  }
  /** The attribution the app must show when it uses this file. */
  readonly credit?: string
  readonly comments?: string
  /** Whether the font's wedges have a head then a tail, or taper to a point. */
  readonly wedges: "headed" | "tapered"
  /** A wedge head's depth divided by its size, in a headed font. */
  readonly headAspect?: number
  /** The angle of a wedge head's back edge from square to its tail, in degrees, anticlockwise. */
  readonly headLean: number
  /** The angle between a Winkelhaken's legs, in degrees. */
  readonly winkelhakenAngle: number
  readonly skeletons: readonly SkeletonEntry[]
}

/**
 * One skeleton: the shapes of a sign as one font draws it. `text` is the
 * characters the font draws as one glyph. An entry with no shapes records a
 * sign the file leaves out on purpose, with `comments` saying why.
 */
export interface SkeletonEntry {
  readonly text: string
  /** The shapes, such as "w 21 69 270 77 15". */
  readonly shapes?: readonly string[]
  readonly comments?: string
  /**
   * Whether the shapes leave out strokes the format can't draw, such as a
   * half-oval, with `comments` saying what.
   */
  readonly partial?: boolean
}

/**
 * The sign data, built from the Oracc Sign List's osl.asl, with the values
 * in order of use too when there is usage data.
 */
export interface OslData {
  readonly signs: readonly OslSign[]
  readonly sequences: readonly OslSequence[]
  /**
   * How many times each value is used in Sumerian and Akkadian together, for
   * the values Oracc's glossaries count. See docs/usage-data.md.
   */
  readonly valueUses?: Readonly<Record<string, number>>
}

/**
 * How the parts of a compound sign combine: × one inside another, & one above
 * the other, % crossed, and . and + side by side. Compounds made of the same
 * parts are offered in this order.
 */
export const COMPOUND_OPERATORS = ["×", "&", "%", ".", "+"] as const

/** One of the {@link COMPOUND_OPERATORS}. */
export type CompoundOperator = (typeof COMPOUND_OPERATORS)[number]

/**
 * The modifiers that make a variant of a sign, with their names as
 * Assyriologists write them. Oracc's GDL specification lists them, with
 * examples: https://oracc.museum.upenn.edu/ns/gdl/1.0/index.html
 */
export const VARIANT_MODIFIERS = {
  g: "gunû",
  t: "tenû",
  s: "šeššig",
  n: "nutillû",
} as const

/** One of the {@link VARIANT_MODIFIERS}: g, t, s or n. */
export type VariantModifier = keyof typeof VARIANT_MODIFIERS

/** A sign in the Oracc Sign List with a Unicode character of its own. */
export interface OslSign {
  readonly char: string
  /** The OSL name, such as AN, LAGAR@g or |GA₂×AN|. */
  readonly name: string
  /** The Unicode character name, such as CUNEIFORM SIGN AN. */
  readonly unicodeName?: string
  /** The id of the sign's OSL page. */
  readonly oslId: string
  /** In OSL order. */
  readonly values: readonly string[]
  /**
   * The same values, most used first. The build always adds it; data made by
   * hand, as in tests, can leave it out, and the sign database then uses the
   * OSL order.
   */
  readonly valuesByUse?: readonly string[]
  /** When OSL lists the character as a form of a sign, that sign's name. */
  readonly formOf?: string
  /** For a compound of encoded signs: how they combine, and their characters. */
  readonly compound?: {
    readonly operator: CompoundOperator
    /** Two or more, in the order the name gives them. */
    readonly parts: readonly string[]
  }
  /** For a variant of an encoded sign: the base sign's character, and the modifier. */
  readonly variant?: { readonly of: string; readonly modifier: VariantModifier }
  /** OSL deprecates the sign; it is listed only so its character has a name. */
  readonly deprecated?: true
}

/** A sequence of signs with readings of its own, such as |PA.TE.SI|, read ensi₂. */
export interface OslSequence {
  readonly chars: string
  readonly name: string
  readonly oslId: string
  /** In OSL order. */
  readonly values: readonly string[]
  /**
   * The same values, most used first. The build always adds it; data made by
   * hand, as in tests, can leave it out, and the sign database then uses the
   * OSL order.
   */
  readonly valuesByUse?: readonly string[]
  readonly formOf?: string
}

/** A language the usage data covers, by Oracc's code: Sumerian or Akkadian. */
export type UsageLanguage = "sux" | "akk"

/**
 * A word in an Oracc glossary: its citation form, English guide word and
 * part of speech, such as du "build" V/t. A name's guide word is a number
 * that tells apart names spelled alike.
 */
export interface UsageWord {
  readonly cf: string
  readonly gw: string
  readonly pos: string
}

/** A value commonly used in a language, and the main words it writes. */
export interface CommonValue {
  readonly value: string
  /** Most used first; empty when the value mostly spells sounds or affixes. */
  readonly words: readonly UsageWord[]
}

/**
 * A sign's or sequence's common values in each language, most used first,
 * built from data/usage/. See docs/usage-data.md.
 */
export type SignUsage = Readonly<
  Partial<Record<UsageLanguage, readonly CommonValue[]>>
>
