import { describe, expect, it } from "vitest"

import type { SequenceState } from "./sequence"
import { SignDatabase } from "./signs"
import { suggestionsAt, type Change } from "./suggest"

const PA = "𒉺"
const TE = "𒋼"
const SI = "𒋛"
const AN = "𒀭"
const GA2 = "𒂷"
const GA2_TIMES_AN = "𒂼"
const A = "𒀀"
const MUŠ = "𒈲"
const A_TIMES_MUŠ = "𒀇"
const MUŠ_TIMES_A = "𒈳"
const LAGAR = "𒇬"
const LAGAR_GUNU = "𒇯"
const A_TIMES_LAGAR_GUNU = "𒀆"
const DU = "𒁺"
const DU_GUNU = "𒁼"
const DU_ŠEŠŠIG = "𒁽"

const database = new SignDatabase([], {
  signs: [
    { char: AN, name: "AN", oslId: "o0000099", values: ["an"] },
    { char: PA, name: "PA", oslId: "o0000497", values: ["pa"] },
    { char: TE, name: "TE", oslId: "o0000550", values: ["te"] },
    { char: SI, name: "SI", oslId: "o0000525", values: ["si"] },
    { char: GA2, name: "GA₂", oslId: "o0000206", values: ["ga₂"] },
    {
      char: GA2_TIMES_AN,
      name: "|GA₂×AN|",
      oslId: "o0001286",
      values: ["ama"],
      compound: { operator: "×", parts: [GA2, AN] },
    },
    { char: A, name: "A", oslId: "o0000087", values: ["a"] },
    { char: MUŠ, name: "MUŠ", oslId: "o0000375", values: ["muš"] },
    {
      char: A_TIMES_MUŠ,
      name: "|A×MUŠ|",
      oslId: "o0000851",
      values: ["amuš"],
      compound: { operator: "×", parts: [A, MUŠ] },
    },
    {
      char: MUŠ_TIMES_A,
      name: "|MUŠ×A|",
      oslId: "o0000376",
      values: ["šeₓ"],
      compound: { operator: "×", parts: [MUŠ, A] },
    },
    { char: LAGAR, name: "LAGAR", oslId: "o0000307", values: ["lagar"] },
    {
      char: LAGAR_GUNU,
      name: "LAGAR@g",
      oslId: "o0000308",
      values: ["du₆"],
      variant: { of: LAGAR, modifier: "g" },
    },
    {
      char: A_TIMES_LAGAR_GUNU,
      name: "|A×LAGAR@g|",
      oslId: "o0000850",
      values: ["šedu₃"],
      compound: { operator: "×", parts: [A, LAGAR_GUNU] },
    },
    { char: DU, name: "DU", oslId: "o0000149", values: ["du"] },
    {
      char: DU_GUNU,
      name: "DU@g",
      oslId: "o0000150",
      values: ["gim₅"],
      variant: { of: DU, modifier: "g" },
    },
    {
      char: DU_ŠEŠŠIG,
      name: "DU@s",
      oslId: "o0000152",
      values: ["gim₄"],
      variant: { of: DU, modifier: "s" },
    },
  ],
  sequences: [
    { chars: PA + TE, name: "|PA.TE|", oslId: "o1", values: ["en₅"] },
    { chars: PA + TE + SI, name: "|PA.TE.SI|", oslId: "o2", values: ["ensi₂"] },
    { chars: TE + SI, name: "|TE.SI|", oslId: "o3", values: ["x"] },
  ],
})

function text(items: string[], cursor = items.length): SequenceState {
  return { items, cursor, cursorPlaced: false }
}

function names(state: SequenceState): string[] {
  return suggestionsAt(state, database).sequences.map((s) => s.name)
}

describe("suggestionsAt", () => {
  it("gives the sign before the cursor", () => {
    expect(suggestionsAt(text([AN, PA], 1), database).sign?.name).toBe("AN")
  })

  it("gives no sign at the start of the text", () => {
    expect(suggestionsAt(text([AN], 0), database)).toEqual({
      changes: [],
      sign: undefined,
      sequences: [],
    })
  })

  it("gives every sequence that ends at the cursor, longest first", () => {
    expect(names(text([AN, PA, TE, SI]))).toEqual(["|PA.TE.SI|", "|TE.SI|"])
  })

  it("looks only before the cursor, not after it", () => {
    expect(names(text([PA, TE, SI], 2))).toEqual(["|PA.TE|"])
  })

  it("finds no sequence for a single sign, even one that starts a sequence", () => {
    expect(names(text([PA]))).toEqual([])
  })
})

describe("suggestionsAt's changes", () => {
  function changes(state: SequenceState): Change[] {
    return [...suggestionsAt(state, database).changes]
  }

  it("combines the two signs before the cursor into their compound", () => {
    expect(changes(text([PA, GA2, AN]))).toEqual([
      { kind: "combine", replaced: GA2 + AN, chars: GA2_TIMES_AN },
    ])
  })

  it("combines two signs typed in the other order too", () => {
    expect(changes(text([AN, GA2]))).toEqual([
      { kind: "combine", replaced: AN + GA2, chars: GA2_TIMES_AN },
    ])
  })

  it("offers the order typed first, when both orders are compounds", () => {
    expect(changes(text([MUŠ, A])).map((c) => c.chars)).toEqual([
      MUŠ_TIMES_A,
      A_TIMES_MUŠ,
    ])
  })

  it("combines only the signs before the cursor", () => {
    expect(changes(text([GA2, AN], 1))).toEqual([])
  })

  it("swaps a sign for each of its variants", () => {
    expect(changes(text([DU]))).toEqual([
      { kind: "swap", replaced: DU, chars: DU_GUNU },
      { kind: "swap", replaced: DU, chars: DU_ŠEŠŠIG },
    ])
  })

  it("swaps a variant back for its sign, or for the sign's other variants", () => {
    expect(changes(text([DU_GUNU])).map((c) => c.chars)).toEqual([
      DU,
      DU_ŠEŠŠIG,
    ])
  })

  it("splits a compound into its parts, in the order of its name", () => {
    expect(changes(text([GA2_TIMES_AN]))).toEqual([
      { kind: "split", replaced: GA2_TIMES_AN, chars: GA2 + AN },
    ])
  })

  it("offers combinations before swaps", () => {
    expect(changes(text([A, LAGAR_GUNU]))).toEqual([
      { kind: "combine", replaced: A + LAGAR_GUNU, chars: A_TIMES_LAGAR_GUNU },
      { kind: "swap", replaced: LAGAR_GUNU, chars: LAGAR },
    ])
  })
})
