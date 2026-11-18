/**
 * Lists each sign's values in order of use, from the counts in data/usage/.
 * See docs/usage-data.md.
 */
import type { OslData } from "../../src/core/types.ts"
import { LANGUAGES, type Language, type ValueUsage } from "./usageCount.ts"

/** How many times each value is used, and the words it writes, by language. */
export type UsageCounts = Partial<
  Record<Language, Readonly<Record<string, ValueUsage>>>
>

/**
 * Adds each sign's and sequence's values in order of use, as `valuesByUse`.
 * A value's place comes from its share of the sign's uses in Sumerian plus
 * its share in Akkadian, so a value common in either language comes early. A
 * larger Sumerian share breaks a tie, and values used in neither keep OSL's
 * order, after the rest. Also adds how often each value is used in both
 * languages together.
 */
export function orderValues(osl: OslData, usage: UsageCounts): OslData {
  const order = <T extends { values: readonly string[] }>(item: T): T => ({
    ...item,
    valuesByUse: byShare(item.values, usage),
  })
  return {
    signs: osl.signs.map(order),
    sequences: osl.sequences.map(order),
    valueUses: valueUses(osl, usage),
  }
}

function byShare(values: readonly string[], usage: UsageCounts): string[] {
  const shares = LANGUAGES.map((language) => sharesOf(values, usage[language]))
  const [sux, akk] = shares
  const score = (i: number) => (sux?.[i] ?? 0) + (akk?.[i] ?? 0)

  // Sorting indices keeps values with equal shares in OSL's order.
  return values
    .map((_, i) => i)
    .sort((a, b) => score(b) - score(a) || (sux?.[b] ?? 0) - (sux?.[a] ?? 0))
    .map((i) => values[i] ?? "")
}

/** Each value's share of the uses of all the values, in one language. */
function sharesOf(
  values: readonly string[],
  counts: UsageCounts[Language],
): number[] {
  const uses = values.map((v) => counts?.[v]?.n ?? 0)
  const total = uses.reduce((sum, n) => sum + n, 0)
  return uses.map((n) => (total > 0 ? n / total : 0))
}

function valueUses(osl: OslData, usage: UsageCounts): Record<string, number> {
  const uses: Record<string, number> = {}
  for (const item of [...osl.signs, ...osl.sequences]) {
    for (const value of item.values) {
      const n = LANGUAGES.reduce(
        (sum, language) => sum + (usage[language]?.[value]?.n ?? 0),
        0,
      )
      if (n > 0) uses[value] = n
    }
  }
  return uses
}
