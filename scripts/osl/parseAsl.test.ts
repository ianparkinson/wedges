import { describe, expect, it } from "vitest"

import { cleanValue, parseAsl } from "./parseAsl"

const SAMPLE = `@sign AN
@oid\to0000099
@ucun\t𒀭
@v\tan
@v\tdiŋir?
@v-\told
@form |AN.AN|
@oid\to0000100
@ucun\t𒀭𒀭
@v\tdidli
@@
@form- AN@t
@v\tskipped
@@
@end sign

@sign- OLD
@oid\to0000001
@ucun\t𒀀
@v\tgone
@unote\tdouble-encoded as x12400
@end sign

@compoundonly X
@v\tignored
`

describe("parseAsl", () => {
  const entries = parseAsl(SAMPLE)

  it("reads signs and their forms, skipping deprecated forms and values", () => {
    expect(entries.map((e) => [e.kind, e.name, e.values])).toEqual([
      ["sign", "AN", ["an", "diŋir"]],
      ["form", "|AN.AN|", ["didli"]],
      ["sign", "OLD", ["gone"]],
    ])
  })

  it("links a form to its sign", () => {
    expect(entries[1]?.sign).toBe(entries[0])
    expect(entries[1]).toMatchObject({ oslId: "o0000100", chars: "𒀭𒀭" })
  })

  it("marks deprecated signs, and reads a double encoding", () => {
    expect(entries[2]).toMatchObject({ deprecated: true, duplicate: "𒐀" })
  })
})

describe("cleanValue", () => {
  it("drops a trailing question mark", () => {
    expect(cleanValue("arhuš₄?")).toBe("arhuš₄")
  })

  it("drops a language tag, as OSL's pages do", () => {
    expect(cleanValue("%akk ṣillu")).toBe("ṣillu")
    expect(cleanValue("%akk/n Ištar")).toBe("Ištar")
  })
})
