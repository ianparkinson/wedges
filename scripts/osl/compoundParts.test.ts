import { describe, expect, it } from "vitest"

import { splitCompound } from "./compoundParts"

describe("splitCompound", () => {
  it.each([
    ["|GA₂×AN|", "×", ["GA₂", "AN"]],
    ["|A×LAGAR@g|", "×", ["A", "LAGAR@g"]],
    ["|AB×(U.U.U)|", "×", ["AB", "|U.U.U|"]],
    ["|(AŠ&AŠ&AŠ)%(AŠ&AŠ&AŠ)|", "%", ["|AŠ&AŠ&AŠ|", "|AŠ&AŠ&AŠ|"]],
    ["|AŠ&AŠ&AŠ|", "&", ["AŠ", "AŠ", "AŠ"]],
    ["|U.U.U|", ".", ["U", "U", "U"]],
  ])("splits %s", (name, operator, parts) => {
    expect(splitCompound(name)).toEqual({ operator, parts })
  })

  it.each(["AN", "|AB×(U.U.U).KU₃|", "|×AN|", "|AN×|"])(
    "rejects %s",
    (name) => {
      expect(splitCompound(name)).toBeNull()
    },
  )
})
