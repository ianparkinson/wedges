/**
 * Finds signs and sign sequences by name, value, code point or the
 * characters themselves. See docs/lookup.md.
 */
import { cuneiformChars } from "./cuneiform"
import {
  charsOf,
  type Sign,
  type SignDatabase,
  type SignListEntry,
} from "./signs"

interface Key {
  readonly text: string
  readonly kind: "name" | "value"
  /** Folded to plain ASCII. */
  readonly folded: string
  /** Folded, but keeping š, ṣ, ṭ and ḫ apart. */
  readonly strict: string
}

/** A sign or sequence, with the keys it can be found by. */
interface Indexed {
  readonly listed: SignListEntry
  readonly keys: readonly Key[]
}

/** An index for {@link search}, built once by {@link buildIndex}. */
export interface LookupIndex {
  readonly database: SignDatabase
  readonly indexed: readonly Indexed[]
}

/** One result of {@link search}: the sign or sequence found, and what about it matched. */
export interface LookupResult {
  readonly found: SignListEntry
  /** The name or value that matched; null when the query was the characters or a code point. */
  readonly match: {
    readonly text: string
    readonly kind: "name" | "value"
  } | null
  readonly tier: Tier
}

/** How well a key matches, best first. */
export const Tier = {
  Exact: 0,
  /** The query is the key without its index: "dingir" finds dingir₂. */
  Index: 1,
  Prefix: 2,
  /** The key contains the query, which is at least three characters long. */
  Contains: 3,
} as const
/** One of the {@link Tier} values. */
export type Tier = (typeof Tier)[keyof typeof Tier]

const MIN_CONTAINS = 3
const DEFAULT_LIMIT = 40

const SUBSCRIPTS: Record<string, string> = {
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "₅": "5",
  "₆": "6",
  "₇": "7",
  "₈": "8",
  "₉": "9",
  ₓ: "x",
}
const SUBSCRIPT = /[₀-₉ₓ]/g

/** The accents NFD splits off, such as the acute in á. */
const COMBINING_MARKS = /[\u0300-\u036f]/g
const IGNORED = /[ʾ'’⁻|.\s]/g

const CODE_POINT = /^(?:u\+)?(1[0-9a-f]{4})$/i

/**
 * Folds a name, value or query to plain lowercase ASCII, so it can be typed
 * without special characters: š ṣ ś → s (also "sh", "sz" and "s,"), ṭ → t,
 * ḫ → h (also "ch"), ŋ ĝ → g, subscript digits → digits, × → x, accents
 * dropped, and ʾ | . and spaces dropped.
 */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .replace(SUBSCRIPT, (c) => SUBSCRIPTS[c] ?? c)
    .replace(/×/g, "x")
    .replace(/[ŋĝ]/g, "g")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/ch/g, "h")
    .replace(/s[hz,]/g, "s")
    .replace(/t,/g, "t")
    .replace(/h,/g, "h")
    .replace(IGNORED, "")
}

/** Lighter folding that keeps š, ṣ, ṭ and ḫ apart, to prefer exact spellings. */
function foldStrict(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFC")
    .replace(SUBSCRIPT, (c) => SUBSCRIPTS[c] ?? c)
    .replace(/×/g, "x")
    .replace(/s[hz]/g, "š")
    .replace(/s,/g, "ṣ")
    .replace(/t,/g, "ṭ")
    .replace(/h,|ch/g, "ḫ")
    .replace(IGNORED, "")
}

/** A value without its index: "dingir2" → "dingir", "sagx" → "sag". */
function withoutIndex(key: string): string {
  return key.replace(/(\d+|x)$/, "")
}

function key(text: string, kind: Key["kind"]): Key {
  return { text, kind, folded: fold(text), strict: foldStrict(text) }
}

/**
 * The keys for a name or value. One with ŋ or ĝ also gets a key that reads
 * it as ng, which is how people often type it: diŋir is found by both digir
 * and dingir. That key keeps the real spelling for the exact-spelling
 * tie-break, so a value written with ng still comes first for "dingir".
 */
function keysFor(text: string, kind: Key["kind"]): Key[] {
  const plain = key(text, kind)
  if (!/[ŋĝ]/i.test(text)) return [plain]
  const asNg = fold(text.replace(/[ŋĝ]/g, "ng").replace(/[ŊĜ]/g, "NG"))
  return [plain, { ...plain, folded: asNg }]
}

/**
 * Builds the index {@link search} uses, with a key for each name and value of
 * every sign and sequence in the database.
 */
export function buildIndex(database: SignDatabase): LookupIndex {
  const listed: SignListEntry[] = [...database.signs, ...database.sequences]
  return {
    database,
    indexed: listed.map((item) => ({
      listed: item,
      keys: [
        ...namesOf(item).flatMap((t) => keysFor(t, "name")),
        ...item.values.flatMap((t) => keysFor(t, "value")),
      ],
    })),
  }
}

/** The OSL name, then for a sign its short Unicode name if that differs. */
function namesOf(listed: SignListEntry): string[] {
  switch (listed.kind) {
    case "sign": {
      const unicode = listed.unicodeName && shortUnicodeName(listed.unicodeName)
      return unicode && unicode !== listed.name
        ? [listed.name, unicode]
        : [listed.name]
    }
    case "sequence":
      return [listed.name]
  }
}

/**
 * A Unicode name without its common prefix: CUNEIFORM SIGN GA2 TIMES AN is
 * GA2 TIMES AN, and CUNEIFORM NUMERIC SIGN THREE ASH is THREE ASH.
 */
export function shortUnicodeName(name: string): string {
  return name.replace(/^CUNEIFORM (?:NUMERIC |PUNCTUATION )?SIGN /, "")
}

function tierOf(folded: string, query: string): Tier | null {
  if (folded === query) return Tier.Exact
  if (!/\d$/.test(query) && withoutIndex(folded) === query) return Tier.Index
  if (folded.startsWith(query)) return Tier.Prefix
  if (query.length >= MIN_CONTAINS && folded.includes(query)) {
    return Tier.Contains
  }
  return null
}

interface Hit {
  readonly found: SignListEntry
  readonly key: Key
  readonly tier: Tier
  /** 0 when the key's exact spelling also matches at this tier, else 1. */
  readonly spelling: 0 | 1
}

/**
 * Best first: by tier; then a key whose spelling matches exactly (with "sh"
 * and "sz" read as š), so "sha" finds ŠA before SA; then names before values,
 * shorter keys, signs before sequences, and code point.
 */
function compare(a: Hit, b: Hit): number {
  return (
    a.tier - b.tier ||
    a.spelling - b.spelling ||
    (a.key.kind === "name" ? 0 : 1) - (b.key.kind === "name" ? 0 : 1) ||
    a.key.folded.length - b.key.folded.length ||
    (a.found.kind === "sign" ? 0 : 1) - (b.found.kind === "sign" ? 0 : 1) ||
    compareChars(charsOf(a.found), charsOf(b.found))
  )
}

/**
 * Orders two runs of characters by code point, one character at a time, and
 * a shorter run before a longer one that starts the same way.
 */
function compareChars(a: string, b: string): number {
  // Cuneiform characters are outside the Basic Multilingual Plane, so each is
  // two UTF-16 units in a string. Spreading the strings splits them into
  // whole characters, so position i is the i-th character, not the i-th unit.
  const aChars = [...a]
  const bChars = [...b]
  for (let i = 0; i < Math.min(aChars.length, bChars.length); i++) {
    const difference =
      (aChars[i]!.codePointAt(0) ?? 0) - (bChars[i]!.codePointAt(0) ?? 0)
    if (difference !== 0) return difference
  }
  return aChars.length - bChars.length
}

/**
 * Searches by name or value, best first. A query containing cuneiform finds
 * those signs, and the sequence they spell if there is one; a code point such
 * as U+1202D or 1202D finds its sign.
 */
export function search(
  index: LookupIndex,
  query: string,
  limit = DEFAULT_LIMIT,
): LookupResult[] {
  const raw = query.trim()
  if (!raw) return []

  const pasted = cuneiformChars(raw)
  if (pasted.length > 0) {
    return pastedSigns(index.database, pasted)
      .slice(0, limit)
      .map((found) => ({ found, match: null, tier: Tier.Exact }))
  }

  const codePoint = CODE_POINT.exec(raw)?.[1]
  if (codePoint) {
    const char = String.fromCodePoint(parseInt(codePoint, 16))
    const found = index.database.sign(char)
    if (found) return [{ found, match: null, tier: Tier.Exact }]
  }

  const folded = fold(raw)
  if (!folded) return []

  const strict = foldStrict(raw)
  const strictStem = strict.replace(/\d+$/, "")
  const spelling = (k: Key, tier: Tier): 0 | 1 =>
    (
      tier === Tier.Exact
        ? k.strict === strict
        : k.strict.startsWith(strictStem)
    )
      ? 0
      : 1

  const hits: Hit[] = []
  for (const { listed, keys } of index.indexed) {
    let best: Hit | undefined
    for (const k of keys) {
      const tier = tierOf(k.folded, folded)
      if (tier === null) continue
      const hit = { found: listed, key: k, tier, spelling: spelling(k, tier) }
      if (!best || compare(hit, best) < 0) best = hit
    }
    if (best) hits.push(best)
  }

  return hits
    .sort(compare)
    .slice(0, limit)
    .map(({ found, key: k, tier }) => ({
      found,
      match: { text: k.text, kind: k.kind },
      tier,
    }))
}

/**
 * The signs for pasted characters, in order and without repeats, after the
 * sequence they spell if there is one. Characters the database doesn't list
 * are left out.
 */
function pastedSigns(
  database: SignDatabase,
  chars: readonly string[],
): SignListEntry[] {
  const sequence = database.sequence(chars.join(""))
  const signs = [...new Set(chars)]
    .map((char) => database.sign(char))
    .filter((sign): sign is Sign => sign !== undefined)
  return sequence ? [sequence, ...signs] : signs
}
