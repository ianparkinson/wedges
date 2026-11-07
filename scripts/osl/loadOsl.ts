/** Builds the sign data from data/osl.asl. See docs/sign-data.md. */
import { readFileSync } from "node:fs"

import type { OslData } from "@/core/types"

import { buildOsl } from "./buildOsl.ts"
import { parseAsl } from "./parseAsl.ts"

/** Where the repo's copy of osl.asl is. */
export const OSL_ASL = new URL("../../data/osl.asl", import.meta.url)

/** Reads and parses data/osl.asl, and builds the sign data from it. */
export function loadOsl(): OslData {
  return buildOsl(parseAsl(readFileSync(OSL_ASL, "utf8")))
}
