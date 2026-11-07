/**
 * Reads the Oracc Sign List source file, osl.asl, into its sign and form
 * entries. Only the tags Wedges uses are kept.
 */

/** One @sign or @form entry of osl.asl, with the tags Wedges uses. */
export interface AslEntry {
  readonly kind: "sign" | "form"
  readonly name: string
  /** The OSL id, which names the entry's page. */
  oslId?: string
  /** The entry's Unicode characters, one or more. */
  chars?: string
  /** The Unicode character name, such as CUNEIFORM SIGN AN. */
  unicodeName?: string
  /** Another character Unicode encodes the same sign as, from "@unote double-encoded as x1243A". */
  duplicate?: string
  readonly values: string[]
  /** For a form, the sign it belongs to. */
  readonly sign?: AslEntry
  /** A deprecated sign (@sign-), kept only so its character has a name. */
  readonly deprecated: boolean
}

const DOUBLE_ENCODED = /^double-encoded as x([0-9A-F]{5})$/i

/** Splits a line into its tag and the rest, which may be separated by a tab or a space. */
function splitTag(line: string): [string, string] {
  const match = /^(@\S*)\s*(.*)$/.exec(line)
  return match ? [match[1]!, match[2]!.trim()] : ["", line.trim()]
}

/**
 * A value as the OSL web pages show it, without a language tag ("%akk ṣillu"
 * is ṣillu) or a trailing "?" (uncertain).
 */
export function cleanValue(raw: string): string {
  const value = raw.trim().replace(/^%\S+\s+/, "")
  return value.endsWith("?") ? value.slice(0, -1) : value
}

/**
 * The full Unicode name, from "CUNEIFORM" on. Two OSL entries have stray
 * words before it: "VARIANT B CUNEIFORM NUMERIC SIGN IMIN VARIANT B" is the
 * character CUNEIFORM NUMERIC SIGN IMIN VARIANT B.
 */
function unicodeName(text: string): string {
  const start = text.indexOf("CUNEIFORM")
  return start > 0 ? text.slice(start) : text
}

/**
 * Parses the text of osl.asl into its sign and form entries, in file order.
 * Deprecated forms (@form-) are skipped; deprecated signs (@sign-) are kept
 * and marked.
 */
export function parseAsl(text: string): AslEntry[] {
  const entries: AslEntry[] = []
  let sign: AslEntry | undefined
  let form: AslEntry | undefined
  /** Inside a deprecated form, whose lines are skipped. */
  let skipping = false

  for (const line of text.split("\n")) {
    if (!line.startsWith("@")) continue
    const [tag, rest] = splitTag(line)
    switch (tag) {
      case "@sign":
      case "@sign-":
        sign = {
          kind: "sign",
          name: rest,
          values: [],
          deprecated: tag === "@sign-",
        }
        entries.push(sign)
        form = undefined
        skipping = false
        continue
      case "@compoundonly":
        sign = form = undefined
        continue
      case "@form":
      case "@form+":
        skipping = false
        if (!sign) continue
        form = {
          kind: "form",
          name: rest,
          values: [],
          sign,
          deprecated: sign.deprecated,
        }
        entries.push(form)
        continue
      case "@form-":
        form = undefined
        skipping = true
        continue
      case "@@":
        form = undefined
        skipping = false
        continue
      case "@end":
        sign = form = undefined
        skipping = false
        continue
    }

    const current = form ?? sign
    if (!current || skipping) continue
    if (tag === "@oid") current.oslId ??= rest
    else if (tag === "@ucun") current.chars ??= rest
    else if (tag === "@uname") current.unicodeName ??= unicodeName(rest)
    else if (tag === "@v") current.values.push(cleanValue(rest))
    else if (tag === "@unote") {
      const code = DOUBLE_ENCODED.exec(rest)?.[1]
      if (code) current.duplicate = String.fromCodePoint(parseInt(code, 16))
    }
  }

  return entries
}
