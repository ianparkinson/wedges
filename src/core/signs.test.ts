import { describe, expect, it } from "vitest"

import {
  codePoint,
  modifierName,
  oslUrl,
  shortUnicodeName,
  SignDatabase,
} from "./signs"
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

  it("finds signs and sequences by their characters", () => {
    expect(db.sign("𒀀")?.name).toBe("A")
    expect(db.sequence("𒀭𒀭")?.values).toEqual(["didli"])
    expect(db.sign("𒐀")).toBeUndefined()
  })

  it("gives lookup every sign and sequence", () => {
    expect(db.lookupEntries.map((e) => [e.kind, e.chars])).toEqual([
      ["sign", "𒀀"],
      ["sign", "𒀭"],
      ["sign", "𒁹"],
      ["sign", "𒁺"],
      ["sign", "𒁼"],
      ["sign", "𒁽"],
      ["sequence", "𒀭𒀭"],
    ])
  })

  it("lists a sign's variants", () => {
    expect(db.variants("𒁺").map((s) => s.name)).toEqual(["DU@g", "DU@s"])
  })

  it("lists no variants for a sign without any", () => {
    expect(db.variants("𒀀")).toEqual([])
  })

  it("knows how many signs the longest sequence has", () => {
    expect(db.longestSequence).toBe(2)
  })

  it("lets lookup find a sign by its Unicode name, when that differs", () => {
    const names = (char: string) =>
      db.lookupEntries.find((e) => e.chars === char)?.names
    expect(names("𒁹")).toEqual(["DIŠ", "DISH"])
    expect(names("𒀭")).toEqual(["AN"])
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

describe("oslUrl", () => {
  it("links to the sign's Oracc page", () => {
    expect(oslUrl({ oslId: "o0000099" })).toBe(
      "https://oracc.museum.upenn.edu/osl/o0000099",
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
