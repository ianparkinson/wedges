/**
 * The Unicode blocks for cuneiform: Cuneiform, Cuneiform Numbers and
 * Punctuation, and Early Dynastic Cuneiform, which run together from U+12000
 * to U+1254F.
 */
const FIRST = 0x12000
const LAST = 0x1254f
const NUMBERS_FIRST = 0x12400
const EARLY_DYNASTIC_FIRST = 0x12480

/**
 * A cuneiform Unicode block: Cuneiform ("main"), Cuneiform Numbers and
 * Punctuation, or Early Dynastic Cuneiform.
 */
export type CuneiformBlock = "main" | "numbers" | "earlyDynastic"

/**
 * The cuneiform block that the first character of some text is in, or
 * undefined if it isn't cuneiform.
 */
export function cuneiformBlock(text: string): CuneiformBlock | undefined {
  const code = text.codePointAt(0) ?? 0
  if (code < FIRST || code > LAST) return undefined
  if (code >= EARLY_DYNASTIC_FIRST) return "earlyDynastic"
  if (code >= NUMBERS_FIRST) return "numbers"
  return "main"
}

/** Whether a character is in the cuneiform blocks. */
export function isCuneiform(char: string): boolean {
  return cuneiformBlock(char) !== undefined
}

/** The cuneiform characters in some text, in order, leaving out everything else. */
export function cuneiformChars(text: string): string[] {
  // Spreading splits a string into whole characters, each two UTF-16 units
  // for cuneiform.
  return [...text].filter(isCuneiform)
}

/** Some text's code points, such as "U+12000 U+1202D". */
export function codePoints(text: string): string {
  return [...text]
    .map((c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase()}`)
    .join(" ")
}
