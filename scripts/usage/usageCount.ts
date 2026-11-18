/**
 * Counts how often each sign value is used in each language, and which words
 * it writes, from the entries and instances of Oracc glossaries. See
 * docs/usage-data.md.
 */
import { writtenSigns } from "./spelling.ts"

/** The languages counted, by Oracc's language code. */
export const LANGUAGES = ["sux", "akk"] as const

/** A language counted: `sux` for Sumerian, `akk` for Akkadian. */
export type Language = (typeof LANGUAGES)[number]

/** The words a glossary is of: a language's words, or names (`qpn`). */
export type GlossaryKind = Language | "qpn"

/** A word in a glossary: citation form, guide word and part of speech. */
export interface Word {
  cf: string
  gw: string
  pos: string
}

/** The parts of a glossary entry that the count reads. */
export interface GlossaryEntry extends Partial<Word> {
  bases?: { n: string }[]
  forms?: { n: string; xis: string }[]
}

/** How often a value is used, and the words it writes, most common first. */
export interface ValueUsage {
  n: number
  words?: (Word & { n: number })[]
}

/** A language's usage, by value. */
export type LanguageUsage = Record<string, ValueUsage>

/** One sign in one spelling of a word, and whether that sign writes it. */
interface SignInForm {
  value: string
  /** In Sumerian, the sign alone makes up one of the word's stems. */
  isStem: boolean
  /** In Akkadian, the sign is a logogram. */
  logogram: boolean
}

/** A spelling of a word, by the key its instances are listed under. */
export interface Form {
  word: Word
  signs: SignInForm[]
}

/**
 * Reads the spellings of a glossary entry, each with the key (`xis`) under
 * which the glossary lists its instances.
 */
export function formsOf(entry: GlossaryEntry): [string, Form][] {
  const word = { cf: entry.cf ?? "", gw: entry.gw ?? "", pos: entry.pos ?? "" }
  const stems = singleSignStems(entry)
  return (entry.forms ?? []).map((form) => {
    const signs = writtenSigns(form.n).map(({ value, logogram }) => ({
      value,
      isStem: stems.has(value),
      logogram,
    }))
    return [form.xis, { word, signs }]
  })
}

/**
 * The values of the stems that are written with one sign, repeated or not:
 * `du₃` for du[build], and `da₃` for dada[hostile], written `da₃-da₃`.
 */
function singleSignStems(entry: GlossaryEntry): Set<string> {
  const stems = new Set<string>()
  for (const base of entry.bases ?? []) {
    const values = new Set(writtenSigns(base.n).map((s) => s.value))
    if (values.size === 1) stems.add([...values][0] ?? "")
  }
  return stems
}

/**
 * The key an instance is counted once under. Oracc refers to a word in a text
 * as `project:text.line.word`. P and Q numbers name the same text in every
 * project, but X numbers belong to their project, so they keep it.
 */
export function instanceKey(ref: string): string {
  const place = ref.slice(ref.indexOf(":") + 1)
  return /^[PQ]/.test(place) ? place : ref
}

/** The text an instance is in, as in {@link instanceKey}. */
function textOf(key: string): string {
  return key.split(".")[0] ?? key
}

/**
 * Tallies value usage across glossaries. Each word in a text is counted once,
 * however many glossaries list it. Add every language glossary before any
 * names glossary, since a name counts under the language most words in its
 * text are in.
 */
export class UsageCount {
  private readonly seen = new Set<string>()
  private readonly textLanguages = new Map<string, Record<Language, number>>()
  private readonly uses = new Map<Language, Map<string, number>>()
  private readonly words = new Map<Language, Map<string, Map<string, number>>>()

  /** Counts the uses of a spelling, given where in which texts they are. */
  add(kind: GlossaryKind, form: Form, refs: Iterable<string>): void {
    for (const ref of refs) this.addInstance(kind, form, instanceKey(ref))
  }

  /** The usage counted for a language, by value. */
  usage(language: Language): LanguageUsage {
    const usage: LanguageUsage = {}
    const uses = this.uses.get(language) ?? new Map<string, number>()
    for (const value of [...uses.keys()].sort()) {
      const words = this.topWords(language, value)
      usage[value] = {
        n: uses.get(value) ?? 0,
        ...(words.length > 0 && { words }),
      }
    }
    return usage
  }

  private addInstance(kind: GlossaryKind, form: Form, key: string): void {
    if (this.seen.has(key)) return
    const language = kind === "qpn" ? this.languageOfText(textOf(key)) : kind
    if (!language) return
    this.seen.add(key)

    if (kind !== "qpn") this.tallyText(textOf(key), language)
    for (const sign of form.signs) {
      increment(mapIn(this.uses, language), sign.value)
      const writes = language === "sux" ? sign.isStem : sign.logogram
      if (writes) {
        const byWord = mapIn(mapIn(this.words, language), sign.value)
        increment(byWord, JSON.stringify(form.word))
      }
    }
  }

  private tallyText(text: string, language: Language): void {
    const tally = this.textLanguages.get(text) ?? { sux: 0, akk: 0 }
    tally[language]++
    this.textLanguages.set(text, tally)
  }

  /** The language most words in a text are in, Sumerian on a tie. */
  private languageOfText(text: string): Language | undefined {
    const tally = this.textLanguages.get(text)
    if (!tally) return undefined
    return tally.akk > tally.sux ? "akk" : "sux"
  }

  private topWords(language: Language, value: string) {
    const byWord =
      this.words.get(language)?.get(value) ?? new Map<string, number>()
    return [...byWord]
      .sort(([, a], [, b]) => b - a)
      .map(([word, n]) => ({ ...(JSON.parse(word) as Word), n }))
  }
}

function mapIn<K, V>(outer: Map<K, Map<string, V>>, key: K): Map<string, V> {
  let inner = outer.get(key)
  if (!inner) {
    inner = new Map()
    outer.set(key, inner)
  }
  return inner
}

function increment(counts: Map<string, number>, key: string): void {
  counts.set(key, (counts.get(key) ?? 0) + 1)
}
