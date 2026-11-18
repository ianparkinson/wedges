/**
 * Serves what the sign info panel shows about each sign's usage, built from
 * data/usage/ and data/osl.asl, as the module "virtual:usage". The app loads
 * it when the panel first opens. See docs/usage-data.md.
 */
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

import type { Plugin } from "vite"

import { loadOsl, OSL_ASL } from "../osl/loadOsl.ts"
import { commonValues } from "./commonValues.ts"
import { loadUsage, usageFile } from "./loadUsage.ts"
import { LANGUAGES } from "./usageCount.ts"

const ID = "virtual:usage"

// The \0 prefix tells other plugins the module isn't a file.
const RESOLVED_ID = "\0" + ID

/** The Vite plugin that serves sign usage as "virtual:usage". */
export function usagePlugin(): Plugin {
  return {
    name: "wedges-usage",
    resolveId(id) {
      return id === ID ? RESOLVED_ID : undefined
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined
      this.addWatchFile(fileURLToPath(OSL_ASL))
      for (const language of LANGUAGES) {
        const file = usageFile(language)
        if (existsSync(file)) this.addWatchFile(fileURLToPath(file))
      }

      // As in virtual:osl, a string for JSON.parse loads faster than an
      // object literal.
      const json = JSON.stringify(commonValues(loadOsl(), loadUsage()))
      return `export const usage = JSON.parse(${JSON.stringify(json)})`
    },
  }
}
