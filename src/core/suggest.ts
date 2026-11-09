/**
 * Suggestions for the text as it stands: changes to the signs before the
 * cursor, such as combining two of them into a compound, then what the sign
 * before the cursor is, and which Oracc Sign List sequences, with readings of
 * their own, end there.
 */
import type { SequenceState } from "./sequence"
import type { Sequence, Sign, SignDatabase } from "./signs"

/**
 * A change to the signs before the cursor: combining the last few into a
 * compound, swapping the last for a variant or the sign it is a variant of,
 * or splitting a compound back into its parts.
 */
export interface Change {
  readonly kind: "combine" | "split" | "swap"
  /** The characters before the cursor that it replaces, one sign each. */
  readonly replaced: string
  /** The characters it puts in their place, one sign each. */
  readonly chars: string
}

/** What {@link suggestionsAt} finds before the cursor. */
export interface Suggestions {
  /** Changes to the signs before the cursor: combinations first, then a split, then swaps. */
  readonly changes: readonly Change[]
  /** The sign before the cursor, if there is one and the database knows it. */
  readonly sign: Sign | undefined
  /** The sequences the signs before the cursor end with, longest first. */
  readonly sequences: readonly Sequence[]
}

/**
 * Finds the changes that can be made to the signs before the cursor, the
 * sign there, and every sequence that the signs before the cursor end with:
 * after GA₂ AN, the compound |GA₂×AN| and the sign AN; after PA TE SI, the
 * sign SI and the sequence PA.TE.SI, read ensi₂.
 */
export function suggestionsAt(
  text: SequenceState,
  database: SignDatabase,
): Suggestions {
  const { items, cursor } = text
  const before = items.slice(0, cursor)
  const last = before.at(-1)
  const sign = last === undefined ? undefined : database.sign(last)

  const sequences: Sequence[] = []
  const longest = Math.min(before.length, database.longestSequence)
  for (let length = longest; length >= 2; length--) {
    const sequence = database.sequence(before.slice(-length).join(""))
    if (sequence) sequences.push(sequence)
  }

  return {
    changes: [
      ...combinations(before, database),
      ...(sign?.compound ? [split(sign.char, sign.compound.parts)] : []),
      ...(sign ? swaps(sign, database) : []),
    ],
    sign,
    sequences,
  }
}

/**
 * The compounds the last few signs make, most parts first. Two parts make a
 * compound in either order, so GA₂ AN and AN GA₂ both make |GA₂×AN|; when
 * both orders are compounds, as with |A×MUŠ| and |MUŠ×A|, the order typed
 * comes first.
 */
function combinations(
  before: readonly string[],
  database: SignDatabase,
): Change[] {
  const changes: Change[] = []
  const most = Math.min(before.length, database.mostCompoundParts)
  for (let count = most; count >= 2; count--) {
    const parts = before.slice(-count)
    const replaced = parts.join("")
    const orders = [replaced]
    const reversed = parts.toReversed().join("")
    if (count === 2 && reversed !== replaced) orders.push(reversed)
    for (const order of orders) {
      for (const compound of database.compounds(order)) {
        changes.push({ kind: "combine", replaced, chars: compound.char })
      }
    }
  }
  return changes
}

/**
 * The signs the sign can be swapped for: its variants, or, for a variant,
 * the sign it is a variant of and that sign's other variants.
 */
function swaps(sign: Sign, database: SignDatabase): Change[] {
  const base = sign.variant?.of
  const others =
    base === undefined
      ? database.variants(sign.char).map((v) => v.char)
      : [base, ...database.variants(base).map((v) => v.char)]
  return others
    .filter((char) => char !== sign.char)
    .map((char) => ({ kind: "swap", replaced: sign.char, chars: char }))
}

/** The change that splits a compound back into its parts, in the order its name gives them. */
function split(compound: string, parts: readonly string[]): Change {
  return { kind: "split", replaced: compound, chars: parts.join("") }
}
