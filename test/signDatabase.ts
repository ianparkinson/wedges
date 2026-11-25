import { SignDatabase, type Sign } from "@/core/signs"
import type { Stroke } from "@/core/strokes"
import type { OslData, SkeletonFile } from "@/core/types"

import noto from "../data/skeletons/noto.json"
import { skeletonStrokes } from "./skeletonStrokes"

const notoFile = noto as SkeletonFile

/**
 * The real sign database, as the app builds it, from the Noto skeletons
 * unless given another skeleton file. Tests pass the sign data from
 * "virtual:osl"; Node scripts, which run without Vite, pass loadOsl().
 */
export function signDatabase(
  osl: OslData,
  file: SkeletonFile = notoFile,
): SignDatabase {
  return new SignDatabase([file], osl)
}

/**
 * Each skeleton's strokes, with its sign in `db`, in file order: what a test
 * needs to draw a sign and check what ranking makes of it. The skeletons are
 * the Noto ones unless given another file, which should be the one `db` was
 * built from. The strokes are normalised, as synthetic drawings expect.
 */
export function skeletonDrawings(
  db: SignDatabase,
  file: SkeletonFile = notoFile,
): { sign: Sign; strokes: Stroke[] }[] {
  return file.skeletons.flatMap(({ text, shapes }) =>
    shapes
      ? [
          {
            sign: db.sign(text)!,
            strokes: skeletonStrokes(shapes, file.winkelhakenAngle),
          },
        ]
      : [],
  )
}
