import { describe, expect, it } from "vitest"

import { writtenSigns } from "./spelling"

const values = (spelling: string) => writtenSigns(spelling).map((s) => s.value)

describe("writtenSigns", () => {
  it("splits a spelling into its values, determinatives included", () => {
    expect(values("{ŋeš}a₂-ni")).toEqual(["ŋeš", "a₂", "ni"])
    expect(values("{d}AMAR.UTU")).toEqual(["d", "amar", "utu"])
  })

  it("marks values written in upper case as logograms", () => {
    expect(writtenSigns("DU₃-uš")).toEqual([
      { value: "du₃", logogram: true },
      { value: "uš", logogram: false },
    ])
  })

  it("keeps a qualifier, which names the sign, in its own case", () => {
    expect(values("kuₓ(DU)-a")).toEqual(["kuₓ(DU)", "a"])
    expect(values("KUₓ(|A.KU|)")).toEqual(["kuₓ(|A.KU|)"])
  })

  it("leaves out numbers, unread signs and compounds written by name", () => {
    expect(values("6(diš) n x |A.AN|-ta")).toEqual(["ta"])
  })

  it("drops editorial marks and a note after a backslash", () => {
    expect(values("[lugal]#-e?\\t")).toEqual(["lugal", "e"])
  })
})
