import { describe, expect, it } from "vitest"

import { cuneiformChars, isCuneiform } from "./cuneiform"

describe("isCuneiform", () => {
  it.each([
    ["𒀀", "the first sign, A"],
    ["𒐀", "a numeral"],
    ["𒕃", "the last Early Dynastic sign"],
  ])("accepts %s, %s", (char) => {
    expect(isCuneiform(char)).toBe(true)
  })

  it.each([
    ["a", "a Latin letter"],
    ["𒕐", "a character just past the cuneiform blocks"],
    ["", "an empty string"],
  ])("rejects %s, %s", (char) => {
    expect(isCuneiform(char)).toBe(false)
  })
})

describe("cuneiformChars", () => {
  it("keeps the cuneiform characters in order, as whole characters", () => {
    expect(cuneiformChars("𒀭 an 𒊭𒀭")).toEqual(["𒀭", "𒊭", "𒀭"])
  })

  it("finds none in plain text", () => {
    expect(cuneiformChars("dingir")).toEqual([])
  })
})
