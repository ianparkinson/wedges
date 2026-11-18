import { describe, expect, it } from "vitest"

import type { OslSign } from "../../src/core/types"
import { orderValues } from "./orderValues"

function sign(values: string[]): OslSign {
  return { char: "𒆕", name: "KAK", oslId: "", values }
}

const KAK = sign(["da₃", "du₃", "gag", "qaq", "ru₂"])

describe("orderValues", () => {
  it("puts the most used values first", () => {
    const osl = orderValues(
      { signs: [KAK], sequences: [] },
      { sux: { "du₃": { n: 70 }, "da₃": { n: 20 }, "ru₂": { n: 10 } } },
    )
    expect(osl.signs[0]?.valuesByUse).toEqual([
      "du₃",
      "da₃",
      "ru₂",
      "gag",
      "qaq",
    ])
  })

  it("adds the shares in each language, so a value common in either comes early", () => {
    // qaq is 30% of KAK's Akkadian uses, and da₃ 10% of its Sumerian and Akkadian ones.
    const osl = orderValues(
      { signs: [KAK], sequences: [] },
      {
        sux: { "du₃": { n: 900 }, "da₃": { n: 100 } },
        akk: { "du₃": { n: 60 }, qaq: { n: 30 }, "da₃": { n: 10 } },
      },
    )
    expect(osl.signs[0]?.valuesByUse).toEqual([
      "du₃",
      "qaq",
      "da₃",
      "gag",
      "ru₂",
    ])
  })

  it("breaks a tie with the Sumerian share", () => {
    const osl = orderValues(
      { signs: [sign(["a", "b"])], sequences: [] },
      { sux: { a: { n: 1 }, b: { n: 3 } }, akk: { a: { n: 3 }, b: { n: 1 } } },
    )
    expect(osl.signs[0]?.valuesByUse).toEqual(["b", "a"])
  })

  it("leaves the values themselves in OSL's order", () => {
    const osl = orderValues(
      { signs: [KAK], sequences: [] },
      { sux: { "du₃": { n: 70 } } },
    )
    expect(osl.signs[0]?.values).toEqual(KAK.values)
  })

  it("keeps OSL's order when there is no usage data", () => {
    const osl = orderValues({ signs: [KAK], sequences: [] }, {})
    expect(osl.signs[0]?.valuesByUse).toEqual(KAK.values)
  })

  it("counts each value's uses in both languages together", () => {
    const osl = orderValues(
      { signs: [KAK], sequences: [] },
      { sux: { "du₃": { n: 70 }, x: { n: 5 } }, akk: { "du₃": { n: 30 } } },
    )
    expect(osl.valueUses).toEqual({ "du₃": 100 })
  })
})
