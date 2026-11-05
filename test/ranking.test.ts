/**
 * Ranking on synthetic drawings: every skeleton, drawn cleanly but in random
 * stroke order, should be among the candidates shown. How often it comes
 * first under noise is the accuracy benchmark's job (npm run bench:accuracy).
 */
import { osl } from "virtual:osl"
import { describe, expect, it } from "vitest"

import { rank } from "@/core/matcher/rank"

import { signDatabase, skeletonDrawings } from "./signDatabase"
import { synthesizeDrawing } from "./synthetic/drawings"
import { Random } from "./synthetic/random"

const SEED = 832
/** As many as the candidate list shows. */
const CANDIDATES = 3

describe("rank on clean drawings of every skeleton", () => {
  const db = signDatabase(osl)
  const random = new Random(SEED)
  const cases = skeletonDrawings(db).map(({ sign, strokes }) => ({
    char: sign.char,
    drawing: synthesizeDrawing(strokes, 0, random),
  }))

  it.each(cases)("shows $char among the candidates", ({ char, drawing }) => {
    const results = rank(drawing, db.drawable, { limit: CANDIDATES })
    expect(results.map((r) => r.sign.char)).toContain(char)
  })
})
