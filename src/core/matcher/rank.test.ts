import { describe, expect, it } from "vitest"

import { parseSpec } from "@/core/spec"

import { prepareSample } from "./match"
import { rank } from "./rank"

const signs = [
  { name: "one", spec: "w 0 5 10 5" },
  { name: "two", spec: "w 0 3 10 3; w 0 7 10 7" },
  { name: "cross", spec: "w 0 5 10 5; w 5 0 5 10" },
  { name: "hook", spec: "h 2 5 8 2 8 8" },
  { name: "three", spec: "w 0 2 10 2; w 0 5 10 5; w 0 8 10 8" },
].map((s) => ({ ...s, samples: [prepareSample(parseSpec(s.spec))] }))

describe("rank", () => {
  it("returns nothing for an empty drawing", () => {
    expect(rank([], signs)).toEqual([])
  })

  it("puts the sign that was drawn first", () => {
    const [best] = rank(parseSpec("w 5 0 5 10; w 0 5 10 5"), signs)
    expect(best?.sign.name).toBe("cross")
    expect(best?.score).toBe(0)
  })

  it("gives the same top results with a limit as without", () => {
    for (const sign of signs) {
      const drawing = parseSpec(sign.spec)
      const full = rank(drawing, signs).map((r) => r.sign.name)
      const limited = rank(drawing, signs, { limit: 2 }).map((r) => r.sign.name)
      expect(limited).toEqual(full.slice(0, 2))
    }
  })

  it("ranks only the signs the filter keeps", () => {
    const results = rank(parseSpec("w 0 5 10 5"), signs, {
      filter: (sign) => sign.name !== "one",
    })
    expect(results.map((r) => r.sign.name)).not.toContain("one")
    expect(results).toHaveLength(signs.length - 1)
  })

  it("scores a sign by its best sample", () => {
    const twoForms = {
      name: "either",
      samples: [
        prepareSample(parseSpec("h 2 5 8 2 8 8")),
        prepareSample(parseSpec("w 0 5 10 5")),
      ],
    }
    const [best] = rank(parseSpec("w 0 5 10 5"), [twoForms])
    expect(best?.score).toBe(0)
    expect(best?.sample).toBe(twoForms.samples[1])
  })
})
