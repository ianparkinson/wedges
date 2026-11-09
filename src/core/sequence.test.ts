import { describe, expect, it } from "vitest"

import {
  editSequence,
  EMPTY_SEQUENCE,
  restoreSequence,
  sequenceText,
  showsCursor,
  type SequenceAction,
  type SequenceState,
} from "./sequence"

const AN = "𒀭"
const KA = "𒅗"
const A = "𒀀"
const PA = "𒉺"
const TE = "𒋼"
const SI = "𒋛"

/** The sequence AN KA A, with the cursor at `cursor`. */
function anKaA(cursor: number, cursorPlaced = false): SequenceState {
  return { items: [AN, KA, A], cursor, cursorPlaced }
}

/** Applies each action in turn, starting from the empty sequence. */
function edits(...actions: SequenceAction[]): SequenceState {
  return actions.reduce(editSequence, EMPTY_SEQUENCE)
}

describe("editSequence", () => {
  it("appends signs in the order they are inserted, with the cursor at the end", () => {
    expect(
      edits({ kind: "insert", chars: AN }, { kind: "insert", chars: KA }),
    ).toEqual({ items: [AN, KA], cursor: 2, cursorPlaced: false })
  })

  it("inserts at the cursor, not at the end, and moves the cursor past the new item", () => {
    expect(editSequence(anKaA(1, true), { kind: "insert", chars: A })).toEqual({
      items: [AN, A, KA, A],
      cursor: 2,
      cursorPlaced: true,
    })
  })

  it("inserts each character of a run as an item of its own", () => {
    expect(
      editSequence(anKaA(1), { kind: "insert", chars: PA + TE + SI }),
    ).toEqual({
      items: [AN, PA, TE, SI, KA, A],
      cursor: 4,
      cursorPlaced: false,
    })
  })

  it("replaces the items before the cursor, leaving those after it", () => {
    expect(
      editSequence(anKaA(2, true), { kind: "replace", count: 2, chars: PA }),
    ).toEqual({ items: [PA, A], cursor: 1, cursorPlaced: true })
  })

  it("replaces one item with several, with the cursor after the last", () => {
    expect(
      editSequence(anKaA(3), { kind: "replace", count: 1, chars: TE + SI }),
    ).toEqual({ items: [AN, KA, TE, SI], cursor: 4, cursorPlaced: false })
  })

  it("replaces only as many items as there are before the cursor", () => {
    expect(
      editSequence(anKaA(1), { kind: "replace", count: 2, chars: PA }),
    ).toEqual({ items: [PA, KA, A], cursor: 1, cursorPlaced: false })
  })

  it("deletes the item before the cursor", () => {
    expect(editSequence(anKaA(2, true), { kind: "deleteBackward" })).toEqual({
      items: [AN, A],
      cursor: 1,
      cursorPlaced: true,
    })
  })

  it("deletes nothing when the cursor is at the start", () => {
    const sequence = anKaA(0)
    expect(editSequence(sequence, { kind: "deleteBackward" })).toBe(sequence)
  })

  it("clears everything, wherever the cursor is", () => {
    expect(editSequence(anKaA(1), { kind: "clear" })).toEqual(EMPTY_SEQUENCE)
  })

  it("moves the cursor without changing the items, and marks it as placed", () => {
    expect(editSequence(anKaA(3), { kind: "moveCursor", to: 1 })).toEqual(
      anKaA(1, true),
    )
  })

  it("stops a cursor moved past either end at that end", () => {
    expect(editSequence(anKaA(1), { kind: "moveCursor", to: 9 })).toEqual(
      anKaA(3, true),
    )
    expect(editSequence(anKaA(1), { kind: "moveCursor", to: -1 })).toEqual(
      anKaA(0, true),
    )
  })
})

describe("sequenceText", () => {
  it("joins the signs into one string, wherever the cursor is", () => {
    expect(sequenceText(anKaA(1, true))).toBe("𒀭𒅗𒀀")
  })
})

describe("showsCursor", () => {
  it("shows a cursor before the end", () => {
    expect(showsCursor(anKaA(0))).toBe(true)
    expect(showsCursor(anKaA(2))).toBe(true)
  })

  it("hides a cursor that edits left at the end, as the usual place to type", () => {
    expect(showsCursor(anKaA(3))).toBe(false)
    expect(showsCursor(EMPTY_SEQUENCE)).toBe(false)
  })

  it("shows a cursor that was placed at the end", () => {
    expect(showsCursor(anKaA(3, true))).toBe(true)
  })

  it("keeps showing a cursor placed at the end as signs are added, replaced and removed", () => {
    const placed = edits(
      { kind: "insert", chars: AN + KA },
      { kind: "moveCursor", to: 2 },
    )
    const added = editSequence(placed, { kind: "insert", chars: A })
    const replaced = editSequence(added, {
      kind: "replace",
      count: 2,
      chars: PA,
    })
    const removed = editSequence(replaced, { kind: "deleteBackward" })

    expect(showsCursor(added)).toBe(true)
    expect(showsCursor(replaced)).toBe(true)
    expect(showsCursor(removed)).toBe(true)
  })

  it("hides the cursor at the end again once the text is cleared", () => {
    const placed = editSequence(anKaA(1), { kind: "moveCursor", to: 3 })
    const cleared = editSequence(placed, { kind: "clear" })
    const retyped = editSequence(cleared, { kind: "insert", chars: AN })

    expect(showsCursor(retyped)).toBe(false)
  })
})

describe("restoreSequence", () => {
  it("gives back a saved sequence as it was", () => {
    expect(restoreSequence(JSON.parse(JSON.stringify(anKaA(2, true))))).toEqual(
      anKaA(2, true),
    )
  })

  it("moves a saved cursor that is out of range to the nearer end", () => {
    expect(
      restoreSequence({ items: [AN], cursor: 5, cursorPlaced: false }),
    ).toEqual({ items: [AN], cursor: 1, cursorPlaced: false })
  })

  it("gives the empty sequence for data that isn't a sequence", () => {
    expect(restoreSequence(null)).toEqual(EMPTY_SEQUENCE)
    expect(restoreSequence("𒀭𒅗")).toEqual(EMPTY_SEQUENCE)
    expect(
      restoreSequence({ items: [AN, 7], cursor: 0, cursorPlaced: false }),
    ).toEqual(EMPTY_SEQUENCE)
    expect(restoreSequence({ items: [AN], cursor: 1 })).toEqual(EMPTY_SEQUENCE)
  })
})
