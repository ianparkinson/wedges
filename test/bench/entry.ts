/**
 * Runs in the browser for scripts/benchPerformance.ts: times ranking synthetic drawings
 * with a given number of strokes against every drawable sign.
 */
import { osl } from "virtual:osl"

import { rank } from "@/core/matcher/rank"

import { signDatabase, skeletonDrawings } from "../signDatabase"
import { synthesizeDrawing } from "../synthetic/drawings"
import { Random } from "../synthetic/random"

const NOISE = 0.6
const DRAWINGS = 10
const CANDIDATES = 3

/** Median milliseconds per ranking, by number of strokes drawn. */
export function timeRanking(strokeCounts: number[]): Record<number, number> {
  const db = signDatabase(osl)
  const skeletons = skeletonDrawings(db)
  const random = new Random(1)
  const result: Record<number, number> = {}
  for (const count of strokeCounts) {
    const pool = skeletons.filter((s) => s.strokes.length >= count)
    const times: number[] = []
    for (let i = 0; i < DRAWINGS; i++) {
      const { strokes } = pool[Math.floor(random.next() * pool.length)]!
      const drawing = synthesizeDrawing(strokes, NOISE, random).slice(0, count)
      const start = performance.now()
      rank(drawing, db.drawable, { limit: CANDIDATES })
      times.push(performance.now() - start)
    }
    times.sort((a, b) => a - b)
    result[count] = times[Math.floor(times.length / 2)]!
  }
  return result
}
