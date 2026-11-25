import { describe, expect, it } from "vitest"

import { parseShape } from "@/core/skeleton"
import { boundingBox } from "@/lib/geometry"
import { maxOf, minOf } from "@/lib/numbers"

import { impression, type StrokeStyle } from "./impression"

const style: StrokeStyle = { tailEnd: 2, taper: 2, legWidth: 0.2 }

describe("impression", () => {
  it("draws a wedge from its head's width down to its tail end", () => {
    const outline = impression(parseShape("w 10 50 0 40 12"), 100, style)
    expect(boundingBox(outline)).toEqual({
      left: 10,
      right: 50,
      top: -56,
      bottom: -44,
    })
    const widthAt = (x: number) =>
      outline.filter((p) => Math.abs(p.x - x) < 1e-9).map((p) => p.y)
    expect(maxOf(widthAt(50)) - minOf(widthAt(50))).toBeCloseTo(2)
  })

  it("curves a wedge's sides in, so it is narrow well before the end", () => {
    const outline = impression(parseShape("w 0 0 0 40 12"), 100, style)
    const halfway = outline.filter((p) => Math.abs(p.x - 20) < 1e-9)
    const width = Math.abs(halfway[0]!.y - halfway[1]!.y)
    expect(width).toBeLessThan((12 + 2) / 2)
  })

  it("draws a headless line at the tail end's width all along", () => {
    const outline = impression(parseShape("w 0 0 0 40 0"), 100, style)
    const { top, bottom } = boundingBox(outline)
    expect(bottom - top).toBeCloseTo(2)
  })

  it("draws a Winkelhaken's legs out to their tips at the given angle", () => {
    const outline = impression(parseShape("k 0 0 0 20"), 90, style)
    const reach = maxOf(outline.map((p) => p.x))
    expect(reach).toBeCloseTo(
      20 * Math.cos(Math.PI / 4) + 1 * Math.sin(Math.PI / 4),
    )
  })

  it("draws a Winkelhaken as six points, symmetric about its bisector", () => {
    // Opening to the right, with its legs 45° above and below the x axis.
    const outline = impression(parseShape("k 0 0 0 20"), 90, style)
    expect(outline).toHaveLength(6)
    const onBisector = outline.filter((p) => Math.abs(p.y) < 1e-9)
    const [outer, inner] = onBisector.map((p) => p.x).toSorted((a, b) => a - b)
    // The outer corner is behind the vertex, and the inner one between the legs.
    expect(outer).toBeLessThan(0)
    expect(inner).toBeGreaterThan(0)
    const mirrored = outline.map((p) => ({ x: p.x, y: -p.y }))
    for (const p of mirrored) {
      expect(outline.some((q) => Math.hypot(p.x - q.x, p.y - q.y) < 1e-9)).toBe(
        true,
      )
    }
  })
})
