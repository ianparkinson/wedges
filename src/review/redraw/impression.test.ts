import { describe, expect, it } from "vitest"

import { parseShape } from "@/core/skeleton"
import { boundingBox } from "@/lib/geometry"

import { impression, type StrokeStyle } from "./impression"

const style: StrokeStyle = { tailEnd: 2, taper: 2, legWidth: 0.2 }

describe("impression", () => {
  it("draws a wedge from its head's width down to its tail end", () => {
    const [outline] = impression(parseShape("w 10 50 0 40 12"), 100, style)
    expect(boundingBox(outline!)).toEqual({
      left: 10,
      right: 50,
      top: -56,
      bottom: -44,
    })
    const widthAt = (x: number) =>
      outline!.filter((p) => Math.abs(p.x - x) < 1e-9).map((p) => p.y)
    expect(Math.max(...widthAt(50)) - Math.min(...widthAt(50))).toBeCloseTo(2)
  })

  it("curves a wedge's sides in, so it is narrow well before the end", () => {
    const [outline] = impression(parseShape("w 0 0 0 40 12"), 100, style)
    const halfway = outline!.filter((p) => Math.abs(p.x - 20) < 1e-9)
    const width = Math.abs(halfway[0]!.y - halfway[1]!.y)
    expect(width).toBeLessThan((12 + 2) / 2)
  })

  it("draws a headless line at the tail end's width all along", () => {
    const [outline] = impression(parseShape("w 0 0 0 40 0"), 100, style)
    const { top, bottom } = boundingBox(outline!)
    expect(bottom - top).toBeCloseTo(2)
  })

  it("draws a Winkelhaken's legs out to their tips at the given angle", () => {
    const legs = impression(parseShape("k 0 0 0 20"), 90, style)
    expect(legs).toHaveLength(2)
    const reach = Math.max(...legs.flat().map((p) => p.x))
    expect(reach).toBeCloseTo(
      20 * Math.cos(Math.PI / 4) + 1 * Math.sin(Math.PI / 4),
    )
  })

  it("fills a Winkelhaken's elbow behind the vertex", () => {
    const legs = impression(parseShape("k 0 0 0 20"), 90, style)
    expect(Math.min(...legs.flat().map((p) => p.x))).toBeLessThan(0)
  })
})
