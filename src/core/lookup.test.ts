import { describe, expect, it } from "vitest"

import { buildIndex, fold, search, Tier, type LookupEntry } from "./lookup"

const entries: LookupEntry[] = [
  { kind: "sign", chars: "𒊭", names: ["ŠA"], values: ["ša", "ša₂₁"] },
  { kind: "sign", chars: "𒊓", names: ["SA"], values: ["sa", "ša₂"] },
  { kind: "sign", chars: "𒀭", names: ["AN"], values: ["an", "diŋir"] },
  { kind: "sign", chars: "𒄑", names: ["GIŠ"], values: ["giš", "ĝeš₂"] },
  { kind: "sign", chars: "𒉺", names: ["PA"], values: ["pa"] },
  { kind: "sign", chars: "𒋼", names: ["TE"], values: ["te"] },
  { kind: "sign", chars: "𒋛", names: ["SI"], values: ["si"] },
  { kind: "sign", chars: "𒂷", names: ["GA₂"], values: ["zaŋa"] },
  { kind: "sign", chars: "𒋃", names: ["SIG₇"], values: ["zanga"] },
  {
    kind: "sequence",
    chars: "𒉺𒋼𒋛",
    names: ["|PA.TE.SI|"],
    values: ["ensi₂", "ṣillu"],
  },
]
const index = buildIndex(entries)
const chars = (query: string) => search(index, query).map((r) => r.entry.chars)

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
      entry: { chars: "𒄑" },
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

  it("returns pasted characters it has no entry for", () => {
    expect(search(index, "𒀀")[0]?.entry).toEqual({
      kind: "sign",
      chars: "𒀀",
      names: [],
      values: [],
    })
  })

  it("returns nothing for a blank or unknown query", () => {
    expect(chars("  ")).toEqual([])
    expect(chars("xyzzy")).toEqual([])
  })

  it("stops at the limit", () => {
    expect(search(index, "a", 1)).toHaveLength(1)
  })
})
