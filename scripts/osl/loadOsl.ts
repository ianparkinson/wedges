/** Builds the sign data from data/osl.asl. See docs/sign-data.md. */
import { readFileSync } from "node:fs"

import type { OslData } from "@/core/types"

import { buildOsl } from "./buildOsl.ts"
import { parseAsl } from "./parseAsl.ts"

export const OSL_ASL = new URL("../../data/osl.asl", import.meta.url)

export function loadOsl(): OslData {
  return buildOsl(parseAsl(readFileSync(OSL_ASL, "utf8")))
}
