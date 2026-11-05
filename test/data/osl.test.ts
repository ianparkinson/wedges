import { osl } from "virtual:osl"
import { describe, expect, it } from "vitest"

import noto from "../../data/skeletons/noto.json"

describe("the sign data built from data/osl.asl", () => {
  const chars = new Set(osl.signs.map((s) => s.char))

  it("lists each character and each sequence once", () => {
    expect(chars.size).toBe(osl.signs.length)
    const sequences = new Set(osl.sequences.map((s) => s.chars))
    expect(sequences.size).toBe(osl.sequences.length)
  })

  it("describes AN as OSL does", () => {
    // A sign whose entry is unlikely to change.
    const an = osl.signs.find((s) => s.char === "𒀭")
    expect(an).toMatchObject({
      name: "AN",
      unicodeName: "CUNEIFORM SIGN AN",
      oslId: "o0000099",
    })
    expect(an?.values).toEqual(expect.arrayContaining(["an", "dingir", "il₃"]))
  })

  it("has an entry for every skeleton", () => {
    const missing = noto.skeletons.filter((t) => !chars.has(t.char))
    expect(missing.map((t) => t.char)).toEqual([])
  })

  it("refers only to signs it lists", () => {
    for (const sign of osl.signs) {
      for (const part of sign.compound?.parts ?? []) {
        expect(chars.has(part), sign.name).toBe(true)
      }
      if (sign.variant) expect(chars.has(sign.variant.of), sign.name).toBe(true)
    }
  })
})
