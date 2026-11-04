/**
 * Ranking on synthetic drawings: every skeleton, drawn cleanly but in random
 * stroke order, should be among the candidates shown. How often it comes
 * first under noise is the accuracy benchmark's job (npm run benchmark).
 */
import { describe, expect, it } from "vitest"

import { rank } from "@/core/matcher/rank"

import { skeletonSigns } from "./skeletonSigns"
import { synthesizeDrawing } from "./synthetic/drawings"
import { Random } from "./synthetic/random"

const SEED = 832
/** As many as the candidate list shows. */
const CANDIDATES = 3

describe("rank on clean drawings of every skeleton", () => {
  const signs = skeletonSigns()
  const random = new Random(SEED)
  const cases = signs.map((sign) => ({
    char: sign.char,
    drawing: synthesizeDrawing(sign.strokes, 0, random),
  }))

  it.each(cases)("shows $char among the candidates", ({ char, drawing }) => {
    const results = rank(drawing, signs, { limit: CANDIDATES })
    expect(results.map((r) => r.sign.char)).toContain(char)
  })
})
