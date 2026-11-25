/** The private-use code points: U+E000–U+F8FF, and planes 15 and 16. */
const PRIVATE_USE = /[-\u{F0000}-\u{10FFFF}]/gu

/**
 * JSON with each private-use character written as `\u` escapes, as UTF-16
 * surrogate pairs above U+FFFF, because editors and diff tools show them as
 * blank boxes. See docs/skeleton-format.md.
 */
export function escapePrivateUse(json: string): string {
  return json.replace(PRIVATE_USE, (char) =>
    Array.from(
      { length: char.length },
      (_, i) =>
        `\\u${char.charCodeAt(i).toString(16).toUpperCase().padStart(4, "0")}`,
    ).join(""),
  )
}
