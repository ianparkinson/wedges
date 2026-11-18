import { describe, expect, it } from "vitest"

import { describeWord } from "./usage"

describe("describeWord", () => {
  it("leaves out a citation form that is just the value without its index", () => {
    expect(describeWord({ cf: "du", gw: "build", pos: "V/t" }, "du₃")).toBe(
      "“build” (transitive verb)",
    )
    expect(describeWord({ cf: "ku", gw: "eat", pos: "V/t" }, "kuₓ(DU)")).toBe(
      "“eat” (transitive verb)",
    )
  })

  it("shows a citation form that differs from the value", () => {
    expect(describeWord({ cf: "uŋ", gw: "people", pos: "N" }, "ug₃")).toBe(
      "uŋ “people” (noun)",
    )
    expect(describeWord({ cf: "epēšu", gw: "do", pos: "V" }, "du₃")).toBe(
      "epēšu “do” (verb)",
    )
  })

  it("describes a name by what it names, without its number", () => {
    expect(describeWord({ cf: "Eʾabzu", gw: "1", pos: "TN" }, "abzu")).toBe(
      "Eʾabzu (temple)",
    )
  })

  it("shows a part of speech it doesn't know as Oracc's tag", () => {
    expect(describeWord({ cf: "x", gw: "y", pos: "ZZ" }, "x")).toBe("“y” (ZZ)")
  })
})
