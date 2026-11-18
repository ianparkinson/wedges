/** Builds the sign data from data/osl.asl. See docs/sign-data.md. */
import { readFileSync } from "node:fs"

import type { OslData } from "@/core/types"

import { loadUsage } from "../usage/loadUsage.ts"
import { orderValues } from "../usage/orderValues.ts"
import { buildOsl } from "./buildOsl.ts"
import { parseAsl } from "./parseAsl.ts"

/** Where the repo's copy of osl.asl is. */
export const OSL_ASL = new URL("../../data/osl.asl", import.meta.url)

/**
 * Reads and parses data/osl.asl, builds the sign data from it, and orders
 * each sign's values by the usage counts in data/usage/.
 */
export function loadOsl(): OslData {
  const osl = buildOsl(parseAsl(readFileSync(OSL_ASL, "utf8")))
  return orderValues(osl, loadUsage())
}
