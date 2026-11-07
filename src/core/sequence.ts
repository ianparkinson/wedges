/**
 * Sequence editing: the text being written, as a list of signs with a cursor
 * between them. Every change to it is a plain-data action, so a sequence
 * could also be edited from elsewhere, such as a phone used as a touchpad, by
 * sending the same actions.
 */

import { clamp } from "./geometry"

/**
 * The text being written: signs, with a cursor. Not to be confused with a
 * `Sequence` in the sign database, which is an Oracc Sign List entry for a
 * run of signs with readings of its own.
 */
export interface SequenceState {
  /** Each item is one sign's character. */
  readonly items: readonly string[]
  /** Where the next item goes: the number of items before the cursor, from 0 to `items.length`. */
  readonly cursor: number
  /** True when the cursor was last moved by `moveCursor`, not by an edit. */
  readonly cursorPlaced: boolean
}

/** An edit to a {@link SequenceState}. */
export type SequenceAction =
  | { readonly kind: "insert"; readonly item: string }
  | { readonly kind: "deleteBackward" }
  | { readonly kind: "clear" }
  | { readonly kind: "moveCursor"; readonly to: number }

/** A sequence with nothing in it. */
export const EMPTY_SEQUENCE: SequenceState = {
  items: [],
  cursor: 0,
  cursorPlaced: false,
}

/**
 * Applies an action to a sequence, returning the sequence after it. Inserting
 * puts the item at the cursor and moves the cursor past it. Deleting backward
 * removes the item before the cursor, and does nothing at the start. A cursor
 * moved outside the sequence stops at its nearer end.
 */
export function editSequence(
  sequence: SequenceState,
  action: SequenceAction,
): SequenceState {
  const { items, cursor } = sequence
  switch (action.kind) {
    case "insert":
      return {
        items: items.toSpliced(cursor, 0, action.item),
        cursor: cursor + 1,
        cursorPlaced: false,
      }
    case "deleteBackward":
      return cursor === 0
        ? sequence
        : {
            items: items.toSpliced(cursor - 1, 1),
            cursor: cursor - 1,
            cursorPlaced: false,
          }
    case "clear":
      return EMPTY_SEQUENCE
    case "moveCursor":
      return {
        items,
        cursor: clamp(action.to, 0, items.length),
        cursorPlaced: true,
      }
  }
}

/** The sequence as plain text, to copy into other apps. */
export function sequenceText(sequence: SequenceState): string {
  return sequence.items.join("")
}

/**
 * Whether to draw the cursor. Typing at the end of a text is the usual case,
 * so a cursor there is hidden, unless the user put it there.
 */
export function showsCursor(sequence: SequenceState): boolean {
  return sequence.cursor < sequence.items.length || sequence.cursorPlaced
}

/**
 * Reads back a sequence that was saved as JSON. Data saved by an older
 * version of the app may not be a sequence any more, and gives the empty one.
 */
export function restoreSequence(value: unknown): SequenceState {
  if (!isSequence(value)) return EMPTY_SEQUENCE
  return {
    items: value.items,
    cursor: clamp(value.cursor, 0, value.items.length),
    cursorPlaced: value.cursorPlaced,
  }
}

function isSequence(value: unknown): value is SequenceState {
  if (typeof value !== "object" || value === null) return false
  const { items, cursor, cursorPlaced } = value as Record<string, unknown>
  return (
    Array.isArray(items) &&
    items.every((item) => typeof item === "string") &&
    Number.isInteger(cursor) &&
    typeof cursorPlaced === "boolean"
  )
}
