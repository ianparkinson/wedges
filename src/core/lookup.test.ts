import { describe, expect, it } from "vitest"

import { buildIndex, fold, search, shortUnicodeName, Tier } from "./lookup"
import { charsOf, SignDatabase } from "./signs"
import type { OslSign } from "./types"

function sign(
  char: string,
  name: string,
  values: string[],
  unicodeName?: string,
): OslSign {
  return { char, name, oslId: "", values, ...(unicodeName && { unicodeName }) }
}

const index = buildIndex(
  new SignDatabase([], {
    signs: [
      sign("𒊭", "ŠA", ["ša", "ša₂₁"]),
      sign("𒊓", "SA", ["sa", "ša₂"]),
      sign("𒀭", "AN", ["an", "diŋir"], "CUNEIFORM SIGN AN"),
      sign("𒄑", "GIŠ", ["giš", "ĝeš₂"]),
      sign("𒉺", "PA", ["pa"]),
      sign("𒋼", "TE", ["te"]),
      sign("𒋛", "SI", ["si"]),
      sign("𒂷", "GA₂", ["zaŋa"]),
      sign("𒋃", "SIG₇", ["zanga"]),
      sign("𒁻", "|DU&DU|", [], "CUNEIFORM SIGN DU OVER DU"),
    ],
    sequences: [
      {
        chars: "𒉺𒋼𒋛",
        name: "|PA.TE.SI|",
        oslId: "",
        values: ["ensi₂", "ṣillu"],
      },
    ],
  }),
)

/** The characters of what a query finds, best first. */
function chars(query: string): string[] {
  return search(index, query).map((r) => charsOf(r.found))
}

describe("fold", () => {
  it.each([
    ["ša", "sa"],
    ["sza", "sa"],
    ["sha", "sa"],
    ["s,a", "sa"],
    ["ṭe", "te"],
    ["ḫa", "ha"],
    ["cha", "ha"],
    ["diŋir", "digir"],
    ["ĝeš", "ges"],
    ["a₂", "a2"],
    ["sagₓ", "sagx"],
    ["|GA₂×AN|", "ga2xan"],
    ["ṣillu", "sillu"],
    ["pa.te.si", "patesi"],
  ])("folds %s to %s", (text, folded) => {
    expect(fold(text)).toBe(folded)
  })
})

describe("search", () => {
  it("finds ŠA before SA for sha, and SA before ŠA for sa", () => {
    expect(chars("sha")).toEqual(["𒊭", "𒊓"])
    expect(chars("sa")).toEqual(["𒊓", "𒊭"])
  })

  it("finds ŋ typed as g or as ng", () => {
    expect(chars("digir")).toEqual(["𒀭"])
    expect(chars("dingir")).toEqual(["𒀭"])
  })

  it("prefers a value spelled with ng to one read as ng", () => {
    expect(chars("zanga")).toEqual(["𒋃", "𒂷"])
  })

  it("finds a value without its index", () => {
    const [first] = search(index, "ges")
    expect(first).toMatchObject({
      found: { char: "𒄑" },
      match: { text: "ĝeš₂", kind: "value" },
      tier: Tier.Index,
    })
  })

  it("finds sequences by their values and names", () => {
    expect(chars("ensi2")).toEqual(["𒉺𒋼𒋛"])
    expect(chars("ensi")).toEqual(["𒉺𒋼𒋛"])
    expect(chars("pa.te.si")).toEqual(["𒉺𒋼𒋛"])
    expect(chars("sillu")).toEqual(["𒉺𒋼𒋛"])
  })

  it("puts a sign before a sequence that matches as well", () => {
    expect(chars("pa")[0]).toBe("𒉺")
  })

  it("matches inside a key only for queries of three or more letters", () => {
    expect(chars("ns")).toEqual([])
    expect(chars("nsi")).toEqual(["𒉺𒋼𒋛"])
  })

  it("finds a sign by code point", () => {
    expect(chars("U+1202D")).toEqual(["𒀭"])
    expect(chars("1202d")).toEqual(["𒀭"])
  })

  it("finds pasted characters, and the sequence they spell", () => {
    expect(chars("𒀭 𒊭𒀭")).toEqual(["𒀭", "𒊭"])
    expect(chars("𒉺𒋼𒋛")).toEqual(["𒉺𒋼𒋛", "𒉺", "𒋼", "𒋛"])
  })

  it("leaves out pasted characters the database doesn't list", () => {
    expect(chars("𒀀𒀭")).toEqual(["𒀭"])
  })

  it("finds a sign by its Unicode name, when that differs", () => {
    expect(chars("du over du")).toEqual(["𒁻"])
  })

  it("doesn't add a sign's Unicode name when it is the OSL name", () => {
    expect(search(index, "an")[0]?.match).toEqual({ text: "AN", kind: "name" })
  })

  it("returns nothing for a blank or unknown query", () => {
    expect(chars("  ")).toEqual([])
    expect(chars("xyzzy")).toEqual([])
  })

  it("stops at the limit", () => {
    expect(search(index, "a", 1)).toHaveLength(1)
  })
})

describe("shortUnicodeName", () => {
  it.each([
    ["CUNEIFORM SIGN GA2 TIMES AN", "GA2 TIMES AN"],
    ["CUNEIFORM NUMERIC SIGN THREE ASH", "THREE ASH"],
    ["CUNEIFORM PUNCTUATION SIGN DIAGONAL COLON", "DIAGONAL COLON"],
  ])("shortens %s to %s", (name, short) => {
    expect(shortUnicodeName(name)).toBe(short)
  })
})
