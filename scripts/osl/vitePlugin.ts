/**
 * Serves the sign data, built from data/osl.asl, as the module
 * "virtual:osl", so the app gets it without a generated file in the repo.
 */
import { fileURLToPath } from "node:url"

import type { Plugin } from "vite"

import { loadOsl, OSL_ASL } from "./loadOsl.ts"

// Vite's convention for a module that isn't a file is a "virtual:" prefix.
const ID = "virtual:osl"
// The \0 prefix tells other plugins the module isn't a file.
const RESOLVED_ID = "\0" + ID

export function oslPlugin(): Plugin {
  return {
    name: "wedges-osl",
    resolveId(id) {
      return id === ID ? RESOLVED_ID : undefined
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined
      this.addWatchFile(fileURLToPath(OSL_ASL))
      // This is the source of the module the app imports. Browsers load a
      // large object faster from JSON.parse of a string than from a
      // JavaScript object literal, so the module holds the data as a string:
      // stringify once to get the JSON, and again to quote it as a string.
      const json = JSON.stringify(loadOsl())
      const quoted = JSON.stringify(json)
      return `export const osl = JSON.parse(${quoted})`
    },
  }
}
