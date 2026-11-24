import { Path } from "opentype.js"
import { describe, expect, it } from "vitest"

import { parseShape } from "@/core/skeleton"
import { boundingBox } from "@/lib/geometry"

import type { Glyph } from "./glyphs"
import { impression, type StrokeStyle } from "./impression"
import { redraw } from "./redraw"

const style: StrokeStyle = { tailEnd: 2, taper: 2, legWidth: 0.2 }

/** A glyph drawn exactly as the font style draws these shapes. */
function glyphOf(shapes: readonly string[]): Glyph {
  const polygons = shapes.flatMap((s) => impression(parseShape(s), 100, style))
  const path = new Path()
  for (const [first, ...rest] of polygons) {
    path.moveTo(first!.x, first!.y)
    for (const p of rest) path.lineTo(p.x, p.y)
    path.close()
  }
  return { path, box: boundingBox(polygons.flat()) }
}

function score(glyph: readonly string[], skeleton: readonly string[]) {
  return redraw(glyphOf(glyph), skeleton.map(parseShape), 100, style).score
}

const CROSS = ["w 13 33 0 78 15", "w 52 72 270 78 15"]

describe("redraw", () => {
  it("scores a skeleton that matches its glyph exactly as a perfect fit", () => {
    expect(score(CROSS, CROSS)).toEqual({
      overlap: 1,
      missed: 0,
      outside: 0,
      shapesOutside: [0, 0],
    })
  })

  it("counts the ink a missing stroke leaves uncovered", () => {
    const { overlap, missed, outside } = score(CROSS, [CROSS[0]!])
    expect(missed).toBeGreaterThan(0.4)
    expect(outside).toBe(0)
    expect(overlap).toBeCloseTo(1 - missed)
  })

  it("finds the shape drawn over white space", () => {
    const { outside, shapesOutside } = score(CROSS, [
      ...CROSS,
      "w 70 10 0 20 10",
    ])
    expect(outside).toBeGreaterThan(0)
    expect(shapesOutside).toEqual([0, 0, 1])
  })

  it("gives a shape that only partly overlaps the ink a fraction", () => {
    const [, partly = 0] = score(CROSS, [
      CROSS[0]!,
      "w 52 50 270 78 15",
    ]).shapesOutside
    expect(partly).toBeGreaterThan(0.1)
    expect(partly).toBeLessThan(0.5)
  })
})
