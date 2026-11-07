/**
 * Finds signs and sign sequences by name, value, code point or the
 * characters themselves. See docs/lookup.md.
 */

/** Something lookup can find: one sign, or a sequence of signs with readings of its own. */
export interface LookupEntry {
  readonly kind: "sign" | "sequence"
  /** One character for a sign, several for a sequence. */
  readonly chars: string
  readonly names: readonly string[]
  readonly values: readonly string[]
}

interface Key {
  readonly text: string
  readonly kind: "name" | "value"
  /** Folded to plain ASCII. */
  readonly folded: string
  /** Folded, but keeping š, ṣ, ṭ and ḫ apart. */
  readonly strict: string
}

interface IndexedEntry {
  readonly entry: LookupEntry
  readonly keys: readonly Key[]
}

/** An index for {@link search}, built once by {@link buildIndex}. */
export interface LookupIndex {
  readonly entries: readonly IndexedEntry[]
  readonly byChars: ReadonlyMap<string, LookupEntry>
}

/** One result of {@link search}: the entry found, and what about it matched. */
export interface LookupResult {
  readonly entry: LookupEntry
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

const CUNEIFORM = /[\u{12000}-\u{1254F}]/gu
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

/** Builds the index {@link search} uses, with a key for each name and value. */
export function buildIndex(entries: readonly LookupEntry[]): LookupIndex {
  return {
    entries: entries.map((entry) => ({
      entry,
      keys: [
        ...entry.names.filter(Boolean).flatMap((t) => keysFor(t, "name")),
        ...entry.values.flatMap((t) => keysFor(t, "value")),
      ],
    })),
    byChars: new Map(entries.map((e) => [e.chars, e])),
  }
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
  readonly entry: LookupEntry
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
    (a.entry.kind === "sign" ? 0 : 1) - (b.entry.kind === "sign" ? 0 : 1) ||
    compareChars(a.entry.chars, b.entry.chars)
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

  const pasted = raw.match(CUNEIFORM)
  if (pasted) {
    const sequence = index.byChars.get(pasted.join(""))
    const signs = [...new Set(pasted)].map(
      (char): LookupEntry =>
        index.byChars.get(char) ?? {
          kind: "sign",
          chars: char,
          names: [],
          values: [],
        },
    )
    const entries = sequence?.kind === "sequence" ? [sequence, ...signs] : signs
    return entries
      .slice(0, limit)
      .map((entry) => ({ entry, match: null, tier: Tier.Exact }))
  }

  const codePoint = CODE_POINT.exec(raw)?.[1]
  if (codePoint) {
    const entry = index.byChars.get(
      String.fromCodePoint(parseInt(codePoint, 16)),
    )
    if (entry) return [{ entry, match: null, tier: Tier.Exact }]
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
  for (const { entry, keys } of index.entries) {
    let best: Hit | undefined
    for (const k of keys) {
      const tier = tierOf(k.folded, folded)
      if (tier === null) continue
      const hit = { entry, key: k, tier, spelling: spelling(k, tier) }
      if (!best || compare(hit, best) < 0) best = hit
    }
    if (best) hits.push(best)
  }

  return hits
    .sort(compare)
    .slice(0, limit)
    .map(({ entry, key: k, tier }) => ({
      entry,
      match: { text: k.text, kind: k.kind },
      tier,
    }))
}
