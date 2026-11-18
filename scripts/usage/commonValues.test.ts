import { describe, expect, it } from "vitest"

import type { OslData } from "../../src/core/types"
import { commonValues } from "./commonValues"

const KAK = "𒆕"

const osl: OslData = {
  signs: [
    { char: KAK, name: "KAK", oslId: "", values: ["da₃", "du₃", "gag", "ru₂"] },
  ],
  sequences: [],
}

function word(gw: string, n: number) {
  return { cf: "du", gw, pos: "V/t", n }
}

describe("commonValues", () => {
  it("lists a sign's values in each language, most used first", () => {
    const usage = commonValues(osl, {
      sux: { "du₃": { n: 700 }, "da₃": { n: 200 }, "ru₂": { n: 100 } },
      akk: { "du₃": { n: 50 } },
    })
    expect(usage[KAK]?.sux?.map((v) => v.value)).toEqual(["du₃", "da₃", "ru₂"])
    expect(usage[KAK]?.akk?.map((v) => v.value)).toEqual(["du₃"])
  })

  it("leaves out a value under 1% of the sign's uses, or used fewer than 10 times", () => {
    const usage = commonValues(osl, {
      sux: { "du₃": { n: 2000 }, "da₃": { n: 19 }, "ru₂": { n: 25 } },
      akk: { "du₃": { n: 50 }, gag: { n: 9 } },
    })
    expect(usage[KAK]?.sux?.map((v) => v.value)).toEqual(["du₃", "ru₂"])
    expect(usage[KAK]?.akk?.map((v) => v.value)).toEqual(["du₃"])
  })

  it("shows up to three words, each at least 5% of the value's uses", () => {
    const usage = commonValues(osl, {
      sux: {
        "du₃": {
          n: 1000,
          words: [
            word("build", 600),
            word("plant", 200),
            word("hold", 100),
            word("make", 60),
            word("rare", 40),
          ],
        },
      },
    })
    expect(usage[KAK]?.sux?.[0]?.words).toEqual([
      { cf: "du", gw: "build", pos: "V/t" },
      { cf: "du", gw: "plant", pos: "V/t" },
      { cf: "du", gw: "hold", pos: "V/t" },
    ])
  })

  it("leaves out a sign with no common values", () => {
    expect(commonValues(osl, { sux: { "du₃": { n: 5 } } })).toEqual({})
  })
})
