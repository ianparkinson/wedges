import type { LookupEntry } from "@/core/lookup"
import type { Sequence, Sign, SignDatabase } from "@/core/signs"

/** An entry in the Oracc Sign List: one sign, or a sequence of signs with readings of its own. */
export type SignListEntry =
  | { readonly kind: "sign"; readonly sign: Sign }
  | { readonly kind: "sequence"; readonly sequence: Sequence }

/**
 * The database's entry for something lookup found, or undefined when the
 * database doesn't know it, as for a pasted character the Oracc data leaves
 * out.
 */
export function findSignListEntry(
  database: SignDatabase,
  { kind, chars }: Pick<LookupEntry, "kind" | "chars">,
): SignListEntry | undefined {
  switch (kind) {
    case "sign": {
      const sign = database.sign(chars)
      return sign && { kind, sign }
    }
    case "sequence": {
      const sequence = database.sequence(chars)
      return sequence && { kind, sequence }
    }
  }
}

/** The entry's OSL name, such as ŠA or |PA.TE.SI|. */
export function entryName(entry: SignListEntry): string {
  switch (entry.kind) {
    case "sign":
      return entry.sign.name
    case "sequence":
      return entry.sequence.name
  }
}

/** The entry's characters: one for a sign, several for a sequence. */
export function entryChars(entry: SignListEntry): string {
  switch (entry.kind) {
    case "sign":
      return entry.sign.char
    case "sequence":
      return entry.sequence.chars
  }
}
