/**
 * Suggestions for the text as it stands: what the sign before the cursor is,
 * and which Oracc Sign List sequences, with readings of their own, end there.
 */
import type { SequenceState } from "./sequence"
import type { Sequence, Sign, SignDatabase } from "./signs"

/** What {@link suggestionsAt} finds before the cursor. */
export interface Suggestions {
  /** The sign before the cursor, if there is one and the database knows it. */
  readonly sign: Sign | undefined
  /** The sequences the signs before the cursor end with, longest first. */
  readonly sequences: readonly Sequence[]
}

/**
 * Finds the sign before the cursor, and every sequence that the signs
 * before the cursor end with: after PA TE SI, the sign SI and the sequence
 * PA.TE.SI, read ensi₂.
 */
export function suggestionsAt(
  text: SequenceState,
  database: SignDatabase,
): Suggestions {
  const { items, cursor } = text
  const before = items.slice(0, cursor)
  const last = before.at(-1)

  const sequences: Sequence[] = []
  const longest = Math.min(before.length, database.longestSequence)
  for (let length = longest; length >= 2; length--) {
    const sequence = database.sequence(before.slice(-length).join(""))
    if (sequence) sequences.push(sequence)
  }

  return {
    sign: last === undefined ? undefined : database.sign(last),
    sequences,
  }
}
