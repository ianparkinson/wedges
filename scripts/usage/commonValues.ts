/**
 * Picks what the sign info panel shows about each sign's usage: its common
 * values in each language, and the main words each writes. See
 * docs/usage-data.md.
 */
import type { CommonValue, OslData, SignUsage } from "../../src/core/types.ts"
import type { UsageCounts } from "./orderValues.ts"
import { LANGUAGES, type ValueUsage } from "./usageCount.ts"

/** A value is rare below this share of a sign's uses in a language. */
const RARE_SHARE = 0.01

/** A value is rare with fewer uses than this in a language. */
const RARE_USES = 10

/** A word is shown when it accounts for at least this share of a value's uses. */
const WORD_SHARE = 0.05

/** The most words shown for a value. */
const WORDS_PER_VALUE = 3

/**
 * Each sign's and sequence's common values, by its characters. A value is
 * common in a language unless it is under 1% of the sign's uses there, or
 * used fewer than 10 times. Signs with no common value in either language
 * are left out.
 */
export function commonValues(
  osl: OslData,
  usage: UsageCounts,
): Record<string, SignUsage> {
  const result: Record<string, SignUsage> = {}
  const items = [
    ...osl.signs.map((s) => ({ chars: s.char, values: s.values })),
    ...osl.sequences,
  ]
  for (const { chars, values } of items) {
    const byLanguage = Object.fromEntries(
      LANGUAGES.flatMap((language) => {
        const common = commonIn(values, usage[language] ?? {})
        return common.length > 0 ? [[language, common]] : []
      }),
    ) as SignUsage
    if (Object.keys(byLanguage).length > 0) result[chars] = byLanguage
  }
  return result
}

/** A sign's common values in one language, most used first. */
function commonIn(
  values: readonly string[],
  counts: Readonly<Record<string, ValueUsage>>,
): CommonValue[] {
  const used = values.flatMap((value) => {
    const found = counts[value]
    return found ? [{ value, ...found }] : []
  })
  const total = used.reduce((sum, v) => sum + v.n, 0)

  return used
    .filter((v) => v.n >= RARE_USES && v.n >= total * RARE_SHARE)
    .sort((a, b) => b.n - a.n)
    .map((v) => ({
      value: v.value,
      words: (v.words ?? [])
        .filter((w) => w.n >= v.n * WORD_SHARE)
        .slice(0, WORDS_PER_VALUE)
        .map(({ cf, gw, pos }) => ({ cf, gw, pos })),
    }))
}
