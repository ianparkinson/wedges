import type { Font } from "opentype.js"
import { useEffect, useMemo, useState } from "react"

import { parseShape } from "@/core/skeleton"

import { glyph } from "./redraw/glyphs"
import type { StrokeStyle } from "./redraw/impression"
import { redraw, type RedrawScore } from "./redraw/redraw"
import type { ReviewSign } from "./reviewSigns"

/** Signs with the redraw check's scores, as far as they have been worked out. */
export interface Scores {
  readonly signs: readonly ReviewSign[]
  /** How many signs with shapes are still waiting for a score. */
  readonly pending: number
}

/** How long to score signs for before letting the page respond, in ms. */
const SLICE = 20

/** How often to show the scores worked out so far, in ms. */
const SHOW_EVERY = 300

/**
 * `signs` with the redraw check's score on each one with shapes, drawn in
 * `style` over `font`. The scores are worked out a few at a time, between
 * which the page keeps responding, and they're kept for each sign's shapes,
 * so a sign that comes back, such as after an edit elsewhere in the file,
 * needn't be scored again.
 */
export function useScores(
  signs: readonly ReviewSign[],
  font: Font,
  winkelhakenAngle: number,
  style: StrokeStyle,
): Scores {
  const [state, setState] = useState<{
    font: Font
    winkelhakenAngle: number
    style: StrokeStyle
    scores: ReadonlyMap<string, RedrawScore | null>
  }>()
  const scores =
    state?.font === font &&
    state.winkelhakenAngle === winkelhakenAngle &&
    state.style === style
      ? state.scores
      : undefined

  useEffect(() => {
    const done = new Map(scores)
    const todo = signs.filter(
      (sign) => sign.shapes && !done.has(scoreKey(sign)),
    )
    if (todo.length === 0) return

    let next = 0
    let shown = performance.now()
    let timer: ReturnType<typeof setTimeout>
    const work = () => {
      const end = performance.now() + SLICE
      while (next < todo.length && performance.now() < end) {
        const sign = todo[next++]!
        const g = glyph(font, sign.text)
        done.set(
          scoreKey(sign),
          g
            ? redraw(g, sign.shapes!.map(parseShape), winkelhakenAngle, style)
            : null,
        )
      }
      if (next === todo.length || performance.now() - shown > SHOW_EVERY) {
        shown = performance.now()
        setState({ font, winkelhakenAngle, style, scores: new Map(done) })
      }
      if (next < todo.length) timer = setTimeout(work)
    }
    timer = setTimeout(work)
    return () => clearTimeout(timer)
  }, [signs, font, winkelhakenAngle, style, scores])

  return useMemo(() => {
    let pending = 0
    const scored = signs.map((sign) => {
      if (!sign.shapes) return sign
      const score = scores?.get(scoreKey(sign))
      if (score === undefined) {
        pending++
        return sign
      }
      return withScore(sign, score)
    })
    return { signs: scored, pending }
  }, [signs, scores])
}

/** What a score depends on, besides the font and style: the sign and its shapes. */
function scoreKey(sign: ReviewSign): string {
  return [sign.text, ...(sign.shapes ?? [])].join("|")
}

/**
 * Each sign with the score last given it, so a sign keeps the same object
 * while its score stays the same, and its tile needn't draw again.
 */
const scoredSigns = new WeakMap<ReviewSign, ReviewSign>()

function withScore(sign: ReviewSign, score: RedrawScore | null): ReviewSign {
  const last = scoredSigns.get(sign)
  if (last?.score === score) return last
  const scored = { ...sign, score }
  scoredSigns.set(sign, scored)
  return scored
}
