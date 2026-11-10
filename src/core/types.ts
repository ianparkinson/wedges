/**
 * Types for the data in data/: the skeleton files in data/skeletons, which
 * the data tests check against their JSON Schema, and the sign data built
 * from data/osl.asl. See docs/skeleton-format.md and docs/sign-data.md.
 */

/** data/skeletons/*.json */
export interface SkeletonFile {
  readonly version: 1
  /** The script style or font the file follows. */
  readonly style: string
  readonly comments?: string
  readonly skeletons: readonly SkeletonEntry[]
}

/** One skeleton: the strokes of a sign as one style or font draws it. */
export interface SkeletonEntry {
  readonly char: string
  /** The strokes, in spec notation. */
  readonly spec: string
  readonly comments?: string
}

/** The sign data, built from the Oracc Sign List's osl.asl. */
export interface OslData {
  readonly signs: readonly OslSign[]
  readonly sequences: readonly OslSequence[]
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
  readonly values: readonly string[]
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
  readonly values: readonly string[]
  readonly formOf?: string
}
