import { describe, expect, it } from "vitest"

import type { OslData, SkeletonFile } from "@/core/types"
import { testFont } from "@test/testFont"

import { reviewSigns, signGroup } from "./reviewSigns"

describe("signGroup", () => {
  it("reads how a sign is made from its OSL name", () => {
    expect(signGroup("KA")).toBe("simple")
    expect(signGroup("AB@g")).toBe("modified")
    expect(signGroup("ASAL₂~a")).toBe("modified")
    expect(signGroup("|A×HA|")).toBe("compound")
    expect(signGroup("|AB@g.AN|")).toBe("compound")
    expect(signGroup(undefined)).toBe("unlisted")
  })
})

describe("reviewSigns", () => {
  const file: SkeletonFile = {
    version: 2,
    font: { family: "Test", version: "1", unitsPerEm: 1000, sha256: "" },
    wedges: "tapered",
    headLean: 0,
    winkelhakenAngle: 100,
    skeletons: [{ text: "𒀀", comments: "Left out." }],
  }
  const osl: OslData = {
    signs: [{ char: "𒁹", name: "DIŠ", oslId: "1", values: ["diš"] }],
    sequences: [],
  }

  it("adds a sign for each cuneiform glyph the file leaves out", () => {
    const signs = reviewSigns(file, testFont(), osl)
    expect(signs.map((r) => [r.key, r.name, r.shapes])).toEqual([
      ["𒀀#0", undefined, undefined],
      ["𒁹#0", "DIŠ", undefined],
    ])
  })

  it("numbers the entries for the same characters", () => {
    const twice = {
      ...file,
      skeletons: [
        { text: "𒁹", shapes: ["w 22 70 270 70 4"] },
        { text: "𒁹", shapes: ["w 22 70 270 60 4"] },
      ],
    }
    expect(reviewSigns(twice, testFont(), osl).map((r) => r.key)).toEqual([
      "𒁹#0",
      "𒁹#1",
    ])
  })
})
