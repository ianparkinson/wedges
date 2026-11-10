/**
 * The few numbers that matching compares for each stroke. See
 * docs/matching.md#2-features.
 */
import {
  bisector,
  direction,
  distance,
  midpoint,
  type Point,
} from "@/lib/geometry"

import type { Stroke } from "../strokes"

/** Keeps a zero-length wedge or leg out of a logarithm. */
const MIN_LENGTH = 1e-3

/** The features of a wedge. */
export interface WedgeFeature {
  readonly kind: "wedge"
  /** The midpoint. */
  readonly position: Point
  /** Direction from head to tail, in radians from −π to π, with y downward. */
  readonly angle: number
  /** Natural log of the length, so that length ratios are differences. */
  readonly logLength: number
}

/** The features of a Winkelhaken. */
export interface WinkelhakenFeature {
  readonly kind: "winkelhaken"
  /** The vertex. */
  readonly position: Point
  /** Natural log of the mean leg length. */
  readonly logSize: number
  /** Direction the angle opens towards, the bisector of the legs, in radians. */
  readonly opening: number
}

/** The features of one stroke, of either kind. */
export type StrokeFeature = WedgeFeature | WinkelhakenFeature

/** Computes the features of one stroke, in the stroke's own coordinates. */
export function strokeFeature(stroke: Stroke): StrokeFeature {
  switch (stroke.kind) {
    case "wedge": {
      const { head, tail } = stroke
      return {
        kind: "wedge",
        position: midpoint(head, tail),
        angle: direction(head, tail),
        logLength: Math.log(Math.max(MIN_LENGTH, distance(head, tail))),
      }
    }
    case "winkelhaken": {
      const { vertex, legA, legB } = stroke
      const legs = distance(vertex, legA) + distance(vertex, legB)
      return {
        kind: "winkelhaken",
        position: vertex,
        logSize: Math.log(Math.max(MIN_LENGTH, legs / 2)),
        opening: bisector(vertex, legA, legB),
      }
    }
  }
}
