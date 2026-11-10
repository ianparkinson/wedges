/**
 * Lookup on the real sign data: what a user types, and the sign or sequence
 * that should come first.
 */
import { osl } from "virtual:osl"
import { describe, expect, it } from "vitest"

import { buildIndex, search } from "@/core/lookup"
import { charsOf } from "@/core/signs"

import { signDatabase } from "./signDatabase"

const BEST_MATCHES: [query: string, chars: string, why: string][] = [
  ["a", "𒀀", "A, by its name"],
  ["a2", "𒀉", "A₂, with the index typed as a digit"],
  ["a₂", "𒀉", "A₂, with a subscript index"],
  ["an", "𒀭", "AN, in lower case"],
  ["dingir", "𒀭", "AN, by its value dingir"],
  ["diŋir", "𒀭", "AN, by its value diŋir"],
  ["sza", "𒊭", "ŠA, with sz for š"],
  ["sha", "𒊭", "ŠA, with sh for š"],
  ["ša", "𒊭", "ŠA"],
  ["s,a", "𒍝", "ZA, by its value ṣa typed as s,"],
  ["t,a", "𒁕", "DA, by its value ṭa typed as t,"],
  ["h,a", "𒄩", "HA, with h, for ḫ"],
  ["ĝeš", "𒄑", "GIŠ, by its value ĝeš"],
  ["isz", "𒅖", "IŠ"],
  ["niŋ2", "𒃻", "GAR, by its value niŋ₂"],
  ["ning2", "𒃻", "GAR, by its value niŋ₂ typed with ng"],
  ["chi", "𒄭", "HI, with ch for ḫ"],
  ["babbar", "𒌓", "UD, by its value babbar"],
  ["1(disz)", "𒁹", "DIŠ, by its numeric value"],
  ["lugal", "𒈗", "LUGAL"],
  ["e2", "𒂍", "E₂"],
  ["lagar@g", "𒇯", "LAGAR@g, a modified sign"],
  ["ga2xan", "𒂼", "|GA₂×AN|, with x for ×"],
  ["GA₂×AN", "𒂼", "|GA₂×AN|, as written"],
  ["ensi2", "𒉺𒋼𒋛", "the sequence PA.TE.SI, by its value"],
  ["pa.te.si", "𒉺𒋼𒋛", "the sequence PA.TE.SI, by its name"],
  ["|PA.TE.SI|", "𒉺𒋼𒋛", "the sequence PA.TE.SI, with bars"],
  ["U+1202D", "𒀭", "AN, by its code point"],
  ["1202d", "𒀭", "AN, by its code point in hex alone"],
  ["𒀭", "𒀭", "AN, pasted as a character"],
  ["du over du", "𒁻", "|DU&DU|, by its Unicode name"],
  ["lu2 opposing lu2", "𒈓", "|LU₂@LU₂|, by its Unicode name"],
  ["𒀭𒀭", "𒀭𒀭", "a pasted sequence"],
]

describe("lookup on the real data", () => {
  const index = buildIndex(signDatabase(osl))

  it.each(BEST_MATCHES)('"%s" finds %s first: %s', (query, chars) => {
    const [best] = search(index, query, 1)
    expect(best && charsOf(best.found)).toBe(chars)
  })

  it("finds nothing for a word that isn't a sign", () => {
    expect(search(index, "xyzzy", 10)).toEqual([])
  })
})
