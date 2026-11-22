import { describe, expect, it } from "vitest"

import type { StrokeFeature } from "./features"
import type { PreparedSample } from "./match"
import { rank } from "./rank"

const DEGREES = Math.PI / 180

/** A wedge's features: its midpoint, direction in degrees (y down), and length. */
function wedge(
  x: number,
  y: number,
  direction: number,
  length: number,
): StrokeFeature {
  return {
    kind: "wedge",
    position: { x, y },
    angle: direction * DEGREES,
    logLength: Math.log(length),
  }
}

/** A Winkelhaken's features: its vertex, opening direction in degrees, and leg length. */
function winkelhaken(
  x: number,
  y: number,
  opening: number,
  size: number,
): StrokeFeature {
  return {
    kind: "winkelhaken",
    position: { x, y },
    logSize: Math.log(size),
    opening: opening * DEGREES,
  }
}

/** Features already in the normalised frame, where a sign is 1 across. */
function sample(...features: StrokeFeature[]): PreparedSample {
  return { features, wedges: features.filter((f) => f.kind === "wedge").length }
}

const forms = {
  one: sample(wedge(0, 0, 0, 1)),
  two: sample(wedge(0, -0.2, 0, 1), wedge(0, 0.2, 0, 1)),
  cross: sample(wedge(0, 0, 0, 1), wedge(0, 0, 90, 1)),
  hook: sample(winkelhaken(-0.5, 0, 0, 1.1)),
  three: sample(wedge(0, -0.3, 0, 1), wedge(0, 0, 0, 1), wedge(0, 0.3, 0, 1)),
}
const signs = Object.entries(forms).map(([name, form]) => ({
  name,
  samples: [form],
}))

describe("rank", () => {
  it("returns nothing for an empty drawing", () => {
    expect(rank(sample(), signs)).toEqual([])
  })

  it("puts the sign that was drawn first", () => {
    const [best] = rank(sample(wedge(0, 0, 90, 1), wedge(0, 0, 0, 1)), signs)
    expect(best?.sign.name).toBe("cross")
    expect(best?.score).toBe(0)
  })

  it("gives the same top results with a limit as without", () => {
    for (const form of Object.values(forms)) {
      const full = rank(form, signs).map((r) => r.sign.name)
      const limited = rank(form, signs, { limit: 2 }).map((r) => r.sign.name)
      expect(limited).toEqual(full.slice(0, 2))
    }
  })

  it("ranks only the signs the filter keeps", () => {
    const results = rank(forms.one, signs, {
      filter: (sign) => sign.name !== "one",
    })
    expect(results.map((r) => r.sign.name)).not.toContain("one")
    expect(results).toHaveLength(signs.length - 1)
  })

  it("scores a sign by its best sample", () => {
    const twoForms = { name: "either", samples: [forms.hook, forms.one] }
    const [best] = rank(forms.one, [twoForms])
    expect(best?.score).toBe(0)
    expect(best?.sample).toBe(forms.one)
  })
})
