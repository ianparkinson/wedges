/**
 * Stroke recognition on synthetic traces of wedges and Winkelhaken that a
 * person might draw: each should come back as the stroke that was drawn.
 */
import { describe, expect, it } from "vitest"

import { distance, type Point } from "@/core/geometry"
import { classifyTrace, type Stroke } from "@/core/strokes"

import { Random } from "./synthetic/random"
import { synthesizeTrace } from "./synthetic/traces"

const SEED = 20261104
const CASES = 300
/** Pixels per grid unit: a sign 10 units across is 250 pixels. */
const SCALE = 25
/**
 * How far, in pixels, each recognised point may be from the one drawn. A
 * flick that carries on in the wedge's direction stays part of the wedge, so
 * this allows for the synthetic flick's 8 pixels.
 */
const TOLERANCE = 12

interface Case {
  readonly name: string
  readonly stroke: Stroke
  readonly trace: Point[]
}

/** The point `length` from `p` in the direction `degrees` clockwise from rightwards. */
function towards(p: Point, degrees: number, length: number): Point {
  const radians = (degrees * Math.PI) / 180
  return {
    x: p.x + length * Math.cos(radians),
    y: p.y + length * Math.sin(radians),
  }
}

/**
 * Wedges 2 to 10 grid units long, and Winkelhaken opening 30° to 120° with
 * legs 2 to 6 units long, the shorter at least half the longer. Both point in
 * any direction.
 */
function cases(): Case[] {
  const random = new Random(SEED)
  const gridPoint = (): Point => ({
    x: random.between(0, 10),
    y: random.between(0, 10),
  })
  const placement = { scale: SCALE, offset: { x: 0, y: 0 } }
  const round = (n: number) => Math.round(n)

  const out: Omit<Case, "trace">[] = []
  for (let i = 0; i < CASES; i++) {
    if (i % 2 === 0) {
      const head = gridPoint()
      const direction = random.between(0, 360)
      const length = random.between(2, 10)
      out.push({
        name: `${i}: a wedge ${length.toFixed(1)} long, pointing ${round(direction)}°`,
        stroke: {
          kind: "wedge",
          head,
          tail: towards(head, direction, length),
        },
      })
    } else {
      const vertex = gridPoint()
      const direction = random.between(0, 360)
      const opening = random.between(30, 120)
      const legA = random.between(2, 6)
      const legB = legA * random.between(0.5, 1)
      out.push({
        name: `${i}: a Winkelhaken opening ${round(opening)}° towards ${round(direction)}°, legs ${legA.toFixed(1)} and ${legB.toFixed(1)}`,
        stroke: {
          kind: "winkelhaken",
          vertex,
          legA: towards(vertex, direction - opening / 2, legA),
          legB: towards(vertex, direction + opening / 2, legB),
        },
      })
    }
  }

  return out.map((c) => ({
    ...c,
    trace: synthesizeTrace(c.stroke, placement, 0, random),
  }))
}

/** The stroke's key points, by name, in pixels. */
function keyPoints(stroke: Stroke, scale = 1): Record<string, Point> {
  const px = (p: Point): Point => ({ x: p.x * scale, y: p.y * scale })
  switch (stroke.kind) {
    case "wedge":
      return { head: px(stroke.head), tail: px(stroke.tail) }
    case "winkelhaken":
      return {
        vertex: px(stroke.vertex),
        legA: px(stroke.legA),
        legB: px(stroke.legB),
      }
  }
}

describe("classifyTrace on synthetic traces", () => {
  it.each(cases())("recognises $name", ({ stroke, trace }) => {
    const recognised = classifyTrace(trace)
    expect(recognised?.kind).toBe(stroke.kind)
    const got = keyPoints(recognised!)
    for (const [name, drawn] of Object.entries(keyPoints(stroke, SCALE))) {
      expect(distance(got[name]!, drawn), name).toBeLessThan(TOLERANCE)
    }
  })
})
