import { describe, expect, it } from "vitest"

import {
  formsOf,
  instanceKey,
  UsageCount,
  type GlossaryEntry,
  type GlossaryKind,
} from "./usageCount"

const BUILD: GlossaryEntry = {
  cf: "du",
  gw: "build",
  pos: "V/t",
  bases: [{ n: "du₃" }],
  forms: [{ n: "mu-un-du₃", xis: "sux.1" }],
}

const HOSTILE: GlossaryEntry = {
  cf: "dada",
  gw: "hostile",
  pos: "AJ",
  bases: [{ n: "da₃-da₃" }],
  forms: [{ n: "da₃-da₃", xis: "sux.2" }],
}

const DO: GlossaryEntry = {
  cf: "epēšu",
  gw: "do",
  pos: "V",
  forms: [
    { n: "DU₃-uš", xis: "akk.1" },
    { n: "e-pu-uš", xis: "akk.2" },
  ],
}

const GUDEA: GlossaryEntry = {
  cf: "Gudea",
  gw: "1",
  pos: "RN",
  bases: [{ n: "gu₃-de₂-a" }],
  forms: [{ n: "gu₃-de₂-a", xis: "qpn.1" }],
}

/** Counts the instances of some entries' spellings: references, by key. */
function add(
  count: UsageCount,
  kind: GlossaryKind,
  entries: GlossaryEntry[],
  instances: [string, string[]][],
) {
  const forms = new Map(entries.flatMap(formsOf))
  for (const [xis, refs] of instances) {
    const form = forms.get(xis)
    if (form) count.add(kind, form, refs)
  }
}

describe("UsageCount", () => {
  it("counts each value once for each use", () => {
    const count = new UsageCount()
    add(count, "sux", [BUILD], [["sux.1", ["a:P1.1.1", "a:P1.2.1"]]])
    expect(count.usage("sux")).toMatchObject({
      mu: { n: 2 },
      un: { n: 2 },
      "du₃": { n: 2 },
    })
  })

  it("attaches a Sumerian word to a value whose sign alone is a stem", () => {
    const count = new UsageCount()
    add(
      count,
      "sux",
      [BUILD, HOSTILE],
      [
        ["sux.1", ["a:P1.1.1"]],
        ["sux.2", ["a:P1.2.1"]],
      ],
    )
    const usage = count.usage("sux")
    expect(usage["du₃"]?.words).toEqual([
      { cf: "du", gw: "build", pos: "V/t", n: 1 },
    ])
    expect(usage["un"]?.words).toBeUndefined()
    expect(usage["da₃"]?.words).toEqual([
      { cf: "dada", gw: "hostile", pos: "AJ", n: 2 },
    ])
  })

  it("attaches an Akkadian word to a value written as a logogram", () => {
    const count = new UsageCount()
    add(
      count,
      "akk",
      [DO],
      [
        ["akk.1", ["b:P2.1.1"]],
        ["akk.2", ["b:P2.2.1"]],
      ],
    )
    const usage = count.usage("akk")
    expect(usage["du₃"]?.words).toEqual([
      { cf: "epēšu", gw: "do", pos: "V", n: 1 },
    ])
    expect(usage["uš"]).toEqual({ n: 2 })
  })

  it("counts a word listed by two projects once", () => {
    const count = new UsageCount()
    add(count, "sux", [BUILD], [["sux.1", ["epsd2:P1.1.1"]]])
    add(count, "sux", [BUILD], [["sux.1", ["dcclt:P1.1.1"]]])
    expect(count.usage("sux")["du₃"]?.n).toBe(1)
  })

  it("counts a name in the language most of its text is in", () => {
    const count = new UsageCount()
    add(count, "sux", [BUILD], [["sux.1", ["a:P1.1.1"]]])
    add(count, "akk", [DO], [["akk.2", ["a:P2.1.1", "a:P2.2.1"]]])
    add(
      count,
      "qpn",
      [GUDEA],
      [["qpn.1", ["a:P1.2.1", "a:P2.3.1", "a:P3.1.1"]]],
    )

    expect(count.usage("sux")["gu₃"]?.n).toBe(1)
    expect(count.usage("akk")["gu₃"]?.n).toBe(1)
  })

  it("lists the words a value writes, most common first", () => {
    const words = ["a", "b", "c", "d"].map((gw, i) => ({
      cf: "du",
      gw,
      pos: "V/t",
      bases: [{ n: "du₃" }],
      forms: [{ n: "du₃", xis: `sux.${i}` }],
    }))
    const count = new UsageCount()
    add(count, "sux", words, [
      ["sux.0", ["a:P1.1.1"]],
      ["sux.1", ["a:P1.2.1", "a:P1.2.2"]],
      ["sux.2", ["a:P1.3.1", "a:P1.3.2", "a:P1.3.3"]],
      ["sux.3", ["a:P1.4.1", "a:P1.4.2"]],
    ])
    expect(count.usage("sux")["du₃"]?.words?.map((w) => w.gw)).toEqual([
      "c",
      "b",
      "d",
      "a",
    ])
  })
})

describe("instanceKey", () => {
  it("drops the project from P and Q numbers, which every project shares", () => {
    expect(instanceKey("epsd2:P100001.3.2")).toBe("P100001.3.2")
    expect(instanceKey("dcclt:Q000040.1.1")).toBe("Q000040.1.1")
  })

  it("keeps the project for X numbers, which are its own", () => {
    expect(instanceKey("akklove:X000001.1.1")).toBe("akklove:X000001.1.1")
  })
})
