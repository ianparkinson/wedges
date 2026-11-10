import { describe, expect, it } from "vitest"

import { charsOf, codePoint, modifierName, oslUrl, SignDatabase } from "./signs"
import type { OslData, SkeletonFile } from "./types"

const osl: OslData = {
  signs: [
    { char: "𒀀", name: "A", oslId: "o0000087", values: ["a"] },
    {
      char: "𒀭",
      name: "AN",
      unicodeName: "CUNEIFORM SIGN AN",
      oslId: "o0000099",
      values: ["an"],
    },
    {
      char: "𒁹",
      name: "DIŠ",
      unicodeName: "CUNEIFORM SIGN DISH",
      oslId: "o0000150",
      values: ["diš"],
    },
    { char: "𒁺", name: "DU", oslId: "o0000149", values: ["du"] },
    {
      char: "𒁼",
      name: "DU@g",
      oslId: "o0000150",
      values: ["gim₅"],
      variant: { of: "𒁺", modifier: "g" },
    },
    {
      char: "𒁽",
      name: "DU@s",
      oslId: "o0000152",
      values: ["gim₄"],
      variant: { of: "𒁺", modifier: "s" },
    },
    { char: "𒈲", name: "MUŠ", oslId: "o0000375", values: ["muš"] },
    {
      char: "𒈸",
      name: "|MUŠ%MUŠ|",
      oslId: "o0000378",
      values: ["hubₓ"],
      compound: { operator: "%", parts: ["𒈲", "𒈲"] },
    },
    {
      char: "𒈶",
      name: "|MUŠ&MUŠ|",
      oslId: "o0000377",
      values: ["sir₂"],
      compound: { operator: "&", parts: ["𒈲", "𒈲"] },
    },
  ],
  sequences: [
    { chars: "𒀭𒀭", name: "|AN.AN|", oslId: "o0000100", values: ["didli"] },
  ],
}

const skeletons = (...chars: string[]): SkeletonFile => ({
  version: 1,
  style: "test-style",
  skeletons: chars.map((char) => ({ char, spec: "w 5 0 5 10" })),
})

describe("SignDatabase", () => {
  const db = new SignDatabase([skeletons("𒁹", "𒀭", "𒐀"), skeletons("𒀭")], osl)

  it("lists drawable signs in skeleton order, leaving out unknown characters", () => {
    expect(db.drawable.map((s) => s.name)).toEqual(["DIŠ", "AN"])
  })

  it("collects every sample of a sign", () => {
    expect(db.sign("𒀭")?.samples).toHaveLength(2)
    expect(db.sign("𒀀")?.samples).toEqual([])
  })

  it("tells signs and sequences apart by kind", () => {
    expect(db.sign("𒀀")?.kind).toBe("sign")
    expect(db.sequence("𒀭𒀭")?.kind).toBe("sequence")
  })

  it("finds signs and sequences by their characters", () => {
    expect(db.sign("𒀀")?.name).toBe("A")
    expect(db.sequence("𒀭𒀭")?.values).toEqual(["didli"])
    expect(db.sign("𒐀")).toBeUndefined()
  })

  it("lists a sign's variants", () => {
    expect(db.variants("𒁺").map((s) => s.name)).toEqual(["DU@g", "DU@s"])
  })

  it("lists no variants for a sign without any", () => {
    expect(db.variants("𒀀")).toEqual([])
  })

  it("finds the compounds made of some parts, & before %", () => {
    expect(db.compounds("𒈲𒈲").map((s) => s.name)).toEqual([
      "|MUŠ&MUŠ|",
      "|MUŠ%MUŠ|",
    ])
    expect(db.compounds("𒀀𒀭")).toEqual([])
  })

  it("knows how many parts the biggest compound has", () => {
    expect(db.mostCompoundParts).toBe(2)
  })

  it("knows how many signs the longest sequence has", () => {
    expect(db.longestSequence).toBe(2)
  })
})

describe("charsOf", () => {
  const db = new SignDatabase([], osl)

  it("gives a sign's one character", () => {
    expect(charsOf(db.sign("𒀭")!)).toBe("𒀭")
  })

  it("gives all of a sequence's characters", () => {
    expect(charsOf(db.sequence("𒀭𒀭")!)).toBe("𒀭𒀭")
  })
})

describe("oslUrl", () => {
  const db = new SignDatabase([], osl)

  it("links to a sign's Oracc page", () => {
    expect(oslUrl(db.sign("𒀭")!)).toBe(
      "https://oracc.museum.upenn.edu/osl/o0000099",
    )
  })

  it("links to a sequence's Oracc page", () => {
    expect(oslUrl(db.sequence("𒀭𒀭")!)).toBe(
      "https://oracc.museum.upenn.edu/osl/o0000100",
    )
  })
})

describe("codePoint", () => {
  it("writes a cuneiform character's code point in hexadecimal", () => {
    expect(codePoint("𒀭")).toBe("U+1202D")
  })

  it("pads a short code point to four digits", () => {
    expect(codePoint("A")).toBe("U+0041")
  })
})

describe("modifierName", () => {
  it("names gunû, the variant with extra strokes", () => {
    expect(modifierName("g")).toBe("gunû")
  })
})
