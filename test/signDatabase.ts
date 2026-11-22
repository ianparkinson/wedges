import { SignDatabase, type Sign } from "@/core/signs"
import { mapPoints, type Stroke } from "@/core/strokes"
import type { OslData, SkeletonFile } from "@/core/types"

import noto from "../data/skeletons/noto.json"
import { skeletonStrokes } from "./skeletonStrokes"

const notoFile = noto as SkeletonFile

/** How wide synthetic drawings expect a sign to be, in their own units. */
const DRAWING_SIZE = 10

/**
 * The real sign database, as the app builds it. Tests pass the sign data from
 * "virtual:osl"; Node scripts, which run without Vite, pass loadOsl().
 */
export function signDatabase(osl: OslData): SignDatabase {
  return new SignDatabase([notoFile], osl)
}

/**
 * Each Noto skeleton's strokes, with its sign in `db`, in file order: what a
 * test needs to draw a sign and check what ranking makes of it. The strokes
 * are scaled so that the longer side of their box runs from 0 to 10, as
 * synthetic drawings expect.
 */
export function skeletonDrawings(
  db: SignDatabase,
): { sign: Sign; strokes: Stroke[] }[] {
  return notoFile.skeletons.flatMap(({ text, shapes }) =>
    shapes
      ? [
          {
            sign: db.sign(text)!,
            strokes: drawingSize(
              skeletonStrokes(shapes, notoFile.winkelhakenAngle),
            ),
          },
        ]
      : [],
  )
}

/** Normalised strokes, centred on (5, 5) with the longer side of their box 10 long. */
function drawingSize(strokes: readonly Stroke[]): Stroke[] {
  const centre = DRAWING_SIZE / 2
  return strokes.map((stroke) =>
    mapPoints(stroke, ({ x, y }) => ({
      x: centre + x * DRAWING_SIZE,
      y: centre + y * DRAWING_SIZE,
    })),
  )
}
