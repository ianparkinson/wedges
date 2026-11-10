/**
 * Turns parsed osl.asl entries into the sign data. See docs/sign-data.md.
 */
// The Vite config loads this file in plain Node, which knows no @/ alias.
import { isCuneiform } from "../../src/core/cuneiform.ts"
import {
  VARIANT_MODIFIERS,
  type OslData,
  type OslSequence,
  type OslSign,
  type VariantModifier,
} from "../../src/core/types.ts"
import { splitCompound } from "./compoundParts.ts"
import type { AslEntry } from "./parseAsl.ts"

/** The variant modifier letters, as a regex character class: [gtsn]. */
const MODIFIER_LETTERS = `[${Object.keys(VARIANT_MODIFIERS).join("")}]`

/** A variant's name: a sign that isn't a compound, @, and a variant modifier. */
const VARIANT_NAME = new RegExp(`^([^|]+)@(${MODIFIER_LETTERS})$`)

/** Maps each current sign's name to its character. */
type CharOfName = ReadonlyMap<string, string>

/**
 * Builds the sign data from parsed osl.asl entries: one sign per cuneiform
 * character, in code point order, and the sequences with readings of their own.
 */
export function buildOsl(entries: readonly AslEntry[]): OslData {
  const usable = byPreference(entries.filter(hasCuneiformPage))
  const signEntries = claimCharacters(
    usable.filter((e) => charsOf(e).length === 1),
  )
  const sequences = collectSequences(
    usable.filter((e) => charsOf(e).length > 1),
  )
  const charOfName = currentSignChars(signEntries)
  const signs = [...signEntries]
    .sort(([a], [b]) => codePoint(a) - codePoint(b))
    .map(([char, entry]) => toSign(char, entry, charOfName))
  return { signs, sequences }
}

function charsOf(entry: AslEntry): string[] {
  return [...(entry.chars ?? "")]
}

function codePoint(char: string): number {
  return char.codePointAt(0) ?? 0
}

/** The OSL id of an entry's page: a form shares its sign's page. */
function pageId(entry: AslEntry): string | undefined {
  return entry.kind === "form" ? entry.sign?.oslId : entry.oslId
}

/**
 * Whether the entry can be listed: it has a page, and characters that are
 * all cuneiform. Entries with no characters are signs Unicode doesn't encode.
 */
function hasCuneiformPage(entry: AslEntry): boolean {
  const chars = charsOf(entry)
  return !!pageId(entry) && chars.length > 0 && chars.every(isCuneiform)
}

/**
 * Entries in order of preference for claiming a character: signs before
 * forms, and current entries before deprecated ones.
 */
function byPreference(entries: readonly AslEntry[]): AslEntry[] {
  const rank = (e: AslEntry) =>
    (e.deprecated ? 2 : 0) + (e.kind === "form" ? 1 : 0)
  return [...entries].sort((a, b) => rank(a) - rank(b))
}

/**
 * Gives each character the first entry, in order of preference, that has
 * it. A double-encoded sign's second character gets the same entry.
 */
function claimCharacters(entries: readonly AslEntry[]): Map<string, AslEntry> {
  const claimed = new Map<string, AslEntry>()
  for (const entry of entries) {
    for (const char of [entry.chars, entry.duplicate]) {
      if (char && isCuneiform(char) && !claimed.has(char)) {
        claimed.set(char, entry)
      }
    }
  }
  return claimed
}

/**
 * The sequences of characters with values of their own, each from its first
 * entry in order of preference. Deprecated entries are left out.
 */
function collectSequences(entries: readonly AslEntry[]): OslSequence[] {
  const sequences = new Map<string, OslSequence>()
  const current = entries.filter((e) => !e.deprecated && e.values.length > 0)
  for (const entry of current) {
    const chars = entry.chars!
    if (sequences.has(chars)) continue
    sequences.set(chars, {
      chars,
      name: entry.name,
      oslId: pageId(entry)!,
      values: unique(entry.values),
      ...formOf(entry),
    })
  }
  return [...sequences.values()]
}

function currentSignChars(claimed: ReadonlyMap<string, AslEntry>): CharOfName {
  const charOfName = new Map<string, string>()
  for (const [char, entry] of claimed) {
    const isCurrentSign = entry.kind === "sign" && !entry.deprecated
    if (isCurrentSign && !charOfName.has(entry.name)) {
      charOfName.set(entry.name, char)
    }
  }
  return charOfName
}

function toSign(
  char: string,
  entry: AslEntry,
  charOfName: CharOfName,
): OslSign {
  return {
    char,
    name: entry.name,

    // A double-encoded sign's second character has a Unicode name of its own.
    ...(entry.unicodeName && char === entry.chars
      ? { unicodeName: entry.unicodeName }
      : {}),
    oslId: pageId(entry)!,
    values: unique(entry.values),
    ...formOf(entry),
    ...compoundOf(entry.name, charOfName),
    ...variantOf(entry.name, charOfName),
    ...(entry.deprecated ? { deprecated: true as const } : {}),
  }
}

function formOf(entry: AslEntry): Pick<OslSign, "formOf"> {
  return entry.kind === "form" && entry.sign ? { formOf: entry.sign.name } : {}
}

/** The compound's operator and parts, if every part is an encoded sign. */
function compoundOf(
  name: string,
  charOfName: CharOfName,
): Pick<OslSign, "compound"> {
  const compound = splitCompound(name)
  if (!compound) return {}
  const parts = compound.parts.map((part) => charOfName.get(part))
  if (!parts.every((part) => part !== undefined)) return {}
  return { compound: { operator: compound.operator, parts } }
}

/** The base sign and modifier, if the base sign is encoded. */
function variantOf(
  name: string,
  charOfName: CharOfName,
): Pick<OslSign, "variant"> {
  const match = VARIANT_NAME.exec(name)
  const base = match ? charOfName.get(match[1]!) : undefined
  if (!match || !base) return {}
  return { variant: { of: base, modifier: match[2] as VariantModifier } }
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}
