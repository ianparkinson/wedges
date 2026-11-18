/**
 * Describes the words a sign's values write, from Oracc's glossaries. See
 * docs/usage-data.md.
 */
import type { UsageWord } from "./types"

/**
 * Oracc's parts of speech, spelled out. The list of tags is in oracc2's
 * lib/cbd/cbdpos.g; tags missing here are shown as they are.
 */
const PARTS_OF_SPEECH: Readonly<Record<string, string>> = {
  N: "noun",
  V: "verb",
  "V/t": "transitive verb",
  "V/i": "intransitive verb",
  AJ: "adjective",
  AV: "adverb",
  NU: "number",
  CNJ: "conjunction",
  J: "interjection",
  MOD: "modal particle",
  PRP: "preposition",
  DP: "demonstrative pronoun",
  IP: "pronoun",
  PP: "possessive pronoun",
  QP: "interrogative pronoun",
  RP: "reflexive pronoun",
  REL: "relative pronoun",
  XP: "indefinite pronoun",
  SBJ: "subjunction",
}

/** Oracc's tags for kinds of name, spelled out. */
const NAMES: Readonly<Record<string, string>> = {
  AN: "agricultural place",
  CN: "celestial body",
  DN: "god",
  EN: "ethnic group",
  FN: "field",
  GN: "place",
  LN: "lineage",
  MN: "month",
  ON: "object",
  PN: "person",
  QN: "city quarter",
  RN: "royal name",
  SN: "settlement",
  TN: "temple",
  WN: "watercourse",
  YN: "year",
}

/**
 * Describes a word that a value writes, for the sign info panel: its guide
 * word in quotes and its part of speech, as `"build" (transitive verb)`. The
 * citation form comes first when it differs from the value without its
 * index, as `epēšu "do" (verb)` for du₃. A name is its citation form and
 * what it names, as `Eʾabzu (temple)`, since its guide word is only a
 * number.
 */
export function describeWord(word: UsageWord, value: string): string {
  const name = NAMES[word.pos]
  if (name) return `${word.cf} (${name})`

  const pos = PARTS_OF_SPEECH[word.pos] ?? word.pos
  const quoted = `“${word.gw}” (${pos})`
  return word.cf === bareValue(value) ? quoted : `${word.cf} ${quoted}`
}

/** A value without its index or qualifier: du₃ is du, kuₓ(DU) is ku. */
function bareValue(value: string): string {
  return value.replace(/\(.*\)$/, "").replace(/[₀-₉ₓ]+$/, "")
}
