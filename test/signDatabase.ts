import { SignDatabase, type Sign } from "@/core/signs"
import { parseSpec } from "@/core/spec"
import type { Stroke } from "@/core/strokes"
import type { OslData } from "@/core/types"

import noto from "../data/skeletons/noto.json"

/**
 * The real sign database, as the app builds it. Tests pass the sign data from
 * "virtual:osl"; Node scripts, which run without Vite, pass loadOsl().
 */
export function signDatabase(osl: OslData): SignDatabase {
  return new SignDatabase([noto as typeof noto & { version: 1 }], osl)
}

/**
 * Each Noto skeleton's strokes, with its sign in `db`, in file order: what a
 * test needs to draw a sign and check what ranking makes of it.
 */
export function skeletonDrawings(
  db: SignDatabase,
): { sign: Sign; strokes: Stroke[] }[] {
  return noto.skeletons.map(({ char, spec }) => ({
    sign: db.sign(char)!,
    strokes: parseSpec(spec),
  }))
}
