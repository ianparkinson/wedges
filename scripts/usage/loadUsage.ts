/** Reads the usage counts in data/usage/. See docs/usage-data.md. */
import { existsSync, readFileSync } from "node:fs"

import type { UsageCounts } from "./orderValues.ts"
import { LANGUAGES, type Language } from "./usageCount.ts"

/** Where a language's usage file is, such as data/usage/sux.json. */
export function usageFile(language: Language): URL {
  return new URL(`../../data/usage/${language}.json`, import.meta.url)
}

/** Reads each language's usage counts, leaving out a file that isn't there. */
export function loadUsage(): UsageCounts {
  const usage: UsageCounts = {}
  for (const language of LANGUAGES) {
    const file = usageFile(language)
    if (existsSync(file)) {
      const data = JSON.parse(readFileSync(file, "utf8")) as {
        values: Record<string, { n: number }>
      }
      usage[language] = data.values
    }
  }
  return usage
}
