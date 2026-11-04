import { describe, expect, it } from "vitest"

import { buildOsl } from "./buildOsl"
import { parseAsl } from "./parseAsl"

const SAMPLE = `@sign AN
@oid\to1
@uname\tCUNEIFORM SIGN AN
@ucun\t𒀭
@v\tan
@end sign
@sign GA₂
@oid\to2
@ucun\t𒂷
@v\tga₂
@end sign
@sign |GA₂×AN|
@oid\to3
@ucun\t𒂼
@v\tama
@end sign
@sign AŠ
@oid\to8
@ucun\t𒀸
@end sign
@sign |AŠ&AŠ&AŠ|
@oid\to9
@ucun\t𒀼
@end sign
@sign LAGAR
@oid\to4
@ucun\t𒇴
@form LAGAR@g
@ucun\t𒇵
@v\tlagar@g
@@
@end sign
@sign |PA.TE.SI|
@oid\to5
@ucun\t𒉺𒋼𒋛
@v\tensi₂
@end sign
@sign |NO.VALUES|
@oid\to6
@ucun\t𒉺𒋼
@end sign
@sign- AN
@oid\to7
@ucun\t𒀭
@v\told
@end sign
`

describe("buildOsl", () => {
  const { signs, sequences } = buildOsl(parseAsl(SAMPLE))
  const byName = new Map(signs.map((s) => [s.name, s]))

  it("lists each character once, preferring current signs", () => {
    expect(signs.map((s) => s.char)).toEqual([
      "𒀭",
      "𒀸",
      "𒀼",
      "𒂷",
      "𒂼",
      "𒇴",
      "𒇵",
    ])
    expect(byName.get("AN")?.values).toEqual(["an"])
  })

  it("gives a form its sign's page", () => {
    expect(byName.get("LAGAR@g")).toMatchObject({
      oslId: "o4",
      formOf: "LAGAR",
    })
  })

  it("records the parts of a compound of encoded signs", () => {
    expect(byName.get("|GA₂×AN|")?.compound).toEqual({
      operator: "×",
      parts: ["𒂷", "𒀭"],
    })
  })

  it("records every part of a compound of more than two", () => {
    expect(byName.get("|AŠ&AŠ&AŠ|")?.compound).toEqual({
      operator: "&",
      parts: ["𒀸", "𒀸", "𒀸"],
    })
  })

  it("keeps the Unicode name", () => {
    expect(byName.get("AN")?.unicodeName).toBe("CUNEIFORM SIGN AN")
  })

  it("records a variant and its base sign", () => {
    expect(byName.get("LAGAR@g")?.variant).toEqual({ of: "𒇴", modifier: "g" })
  })

  it("keeps sequences that have values", () => {
    expect(sequences).toEqual([
      { chars: "𒉺𒋼𒋛", name: "|PA.TE.SI|", oslId: "o5", values: ["ensi₂"] },
    ])
  })
})
