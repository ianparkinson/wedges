/**
 * Reads the sign values out of a spelling in an Oracc glossary, such as
 * `{ŋeš}a₂-ni` or `{d}AMAR.UTU`. See docs/usage-data.md.
 */

/** One sign in a spelling. */
export interface WrittenSign {
  /** The value in lower case, with any qualifier, such as `du₃` or `kuₓ(DU)`. */
  value: string
  /** Whether the value is written in upper case, which marks a logogram. */
  logogram: boolean
}

/** Characters that separate signs, outside brackets and bars. */
const SEPARATORS = new Set(["-", ".", "{", "}", "+", ":", " "])

/** Editorial marks, such as damage and corrections, around a value. */
const MARKS = /[#?!*[\]<>⸢⸣]/g

/** Numbers, as in `6(diš)` or `n`, and unread signs. */
const NOT_A_VALUE = /^([\dn]+(\(.*\))?|x|…)$/i

/**
 * Splits a spelling into its signs, in order. Determinatives count as signs.
 * Text after a `\` is a note on the sign form and is dropped. Numbers, unread
 * signs and compounds written by name, such as `|A.AN|`, are left out, since
 * none of them is an OSL value.
 */
export function writtenSigns(spelling: string): WrittenSign[] {
  const signs: WrittenSign[] = []
  for (const token of tokens(spelling.split("\\")[0] ?? "")) {
    const sign = toWrittenSign(token.replace(MARKS, ""))
    if (sign) signs.push(sign)
  }
  return signs
}

/**
 * Splits at the separators, but not inside a qualifier's brackets or a
 * compound's bars: `kuₓ(|A.KU|)` and `|A.AN|` are one token each.
 */
function tokens(spelling: string): string[] {
  const found: string[] = []
  let current = ""
  let depth = 0
  let inBars = false
  for (const char of spelling) {
    if (char === "|") inBars = !inBars
    if (char === "(") depth++
    if (char === ")") depth--

    if (SEPARATORS.has(char) && depth === 0 && !inBars) {
      if (current) found.push(current)
      current = ""
    } else {
      current += char
    }
  }
  if (current) found.push(current)
  return found
}

function toWrittenSign(token: string): WrittenSign | undefined {
  if (!token || token.startsWith("|") || NOT_A_VALUE.test(token)) {
    return undefined
  }

  // The qualifier names the sign, so it keeps its case: kuₓ(DU).
  const qualifier = token.indexOf("(")
  const reading = qualifier === -1 ? token : token.slice(0, qualifier)
  const lower = reading.toLowerCase()
  return {
    value: lower + (qualifier === -1 ? "" : token.slice(qualifier)),
    logogram: lower !== reading,
  }
}
