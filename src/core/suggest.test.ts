import { describe, expect, it } from "vitest"

import type { SequenceState } from "./sequence"
import { SignDatabase } from "./signs"
import { suggestionsAt } from "./suggest"

const PA = "𒉺"
const TE = "𒋼"
const SI = "𒋛"
const AN = "𒀭"

const database = new SignDatabase([], {
  signs: [
    { char: AN, name: "AN", oslId: "o0000099", values: ["an"] },
    { char: PA, name: "PA", oslId: "o0000497", values: ["pa"] },
    { char: TE, name: "TE", oslId: "o0000550", values: ["te"] },
    { char: SI, name: "SI", oslId: "o0000525", values: ["si"] },
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
