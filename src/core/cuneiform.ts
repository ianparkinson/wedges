/**
 * The Unicode blocks for cuneiform: Cuneiform, Cuneiform Numbers and
 * Punctuation, and Early Dynastic Cuneiform, which run together from U+12000
 * to U+1254F.
 */
const FIRST = 0x12000
const LAST = 0x1254f

/** Whether a character is in the cuneiform blocks. */
export function isCuneiform(char: string): boolean {
  const code = char.codePointAt(0) ?? 0
  return code >= FIRST && code <= LAST
}

/** The cuneiform characters in some text, in order, leaving out everything else. */
export function cuneiformChars(text: string): string[] {
  // Spreading splits a string into whole characters, each two UTF-16 units
  // for cuneiform.
  return [...text].filter(isCuneiform)
}
