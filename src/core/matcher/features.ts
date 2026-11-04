/**
 * The few numbers that matching compares for each stroke. See
 * docs/matching.md#2-features.
 */
import type { Point } from "../geometry"
import type { Stroke } from "../strokes"

/** Keeps a zero-length wedge or leg out of a logarithm. */
const MIN_LENGTH = 1e-3

export interface WedgeFeature {
  readonly kind: "wedge"
  /** The midpoint. */
  readonly position: Point
  /** Direction from head to tail, in radians from −π to π, with y downward. */
  readonly angle: number
  /** Natural log of the length, so that length ratios are differences. */
  readonly logLength: number
}

export interface WinkelhakenFeature {
  readonly kind: "winkelhaken"
  /** The vertex. */
  readonly position: Point
  /** Natural log of the mean leg length. */
  readonly logSize: number
  /** Direction the angle opens towards, the bisector of the legs, in radians. */
  readonly opening: number
}

export type StrokeFeature = WedgeFeature | WinkelhakenFeature

export function strokeFeature(stroke: Stroke): StrokeFeature {
  switch (stroke.kind) {
    case "wedge": {
      const { head, tail } = stroke
      return {
        kind: "wedge",
        position: { x: (head.x + tail.x) / 2, y: (head.y + tail.y) / 2 },
        angle: Math.atan2(tail.y - head.y, tail.x - head.x),
        logLength: Math.log(
          Math.max(MIN_LENGTH, Math.hypot(tail.x - head.x, tail.y - head.y)),
        ),
      }
    }
    case "winkelhaken": {
      const { vertex: v, legA: a, legB: b } = stroke
      const la = Math.hypot(a.x - v.x, a.y - v.y) || MIN_LENGTH
      const lb = Math.hypot(b.x - v.x, b.y - v.y) || MIN_LENGTH
      const ox = (a.x - v.x) / la + (b.x - v.x) / lb
      const oy = (a.y - v.y) / la + (b.y - v.y) / lb
      return {
        kind: "winkelhaken",
        position: v,
        logSize: Math.log((la + lb) / 2),
        opening: Math.atan2(oy, ox),
      }
    }
  }
}
