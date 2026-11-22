/**
 * Reads the shapes in a skeleton file, such as "w 21 69 270 77 15", and
 * prepares them for matching. See docs/skeleton-format.md.
 */
import { midpoint, pointAt, wrapAngle, type Point } from "@/lib/geometry"

import type { StrokeFeature } from "./matcher/features"
import { prepareSample, type PreparedSample } from "./matcher/match"

/**
 * A wedge as a skeleton file gives it, in the font's frame: y points up, and
 * the direction is in degrees anticlockwise from rightwards.
 */
export interface WedgeShape {
  readonly kind: "wedge"
  /** The midpoint of the head's back edge. */
  readonly start: Point
  /** From the start towards the end of the tail. */
  readonly direction: number
  /** From the start to the end of the tail. */
  readonly length: number
  /** The width of the head's back edge; 0 for a headless line. */
  readonly head: number
}

/** A Winkelhaken as a skeleton file gives it, in the same frame as {@link WedgeShape}. */
export interface WinkelhakenShape {
  readonly kind: "winkelhaken"
  /** Where the centre lines of the legs meet. */
  readonly vertex: Point
  /** From the vertex towards the open side. */
  readonly direction: number
  /** The length of each leg. */
  readonly leg: number
}

/** One shape in a skeleton. */
export type Shape = WedgeShape | WinkelhakenShape

const WEDGE_OP = "w"
const WINKELHAKEN_OP = "k"
const WEDGE_NUMBERS = 5
const WINKELHAKEN_NUMBERS = 4
const DEGREES = Math.PI / 180

/** Reads one shape string. Throws on an unknown op, or the wrong count of numbers. */
export function parseShape(text: string): Shape {
  const [op, ...args] = text.trim().split(/\s+/)
  const numbers = args.map(Number)
  if (!numbers.every((n) => Number.isFinite(n))) {
    throw new Error(`Bad number in shape "${text}"`)
  }

  const [x = 0, y = 0, direction = 0, size = 0, head = 0] = numbers
  if (op === WEDGE_OP && numbers.length === WEDGE_NUMBERS) {
    return { kind: "wedge", start: { x, y }, direction, length: size, head }
  }
  if (op === WINKELHAKEN_OP && numbers.length === WINKELHAKEN_NUMBERS) {
    return { kind: "winkelhaken", vertex: { x, y }, direction, leg: size }
  }

  throw new Error(`Bad shape "${text}"`)
}

/**
 * A shape's key points in the frame strokes are drawn in, where y points
 * down: a wedge's start and the end of its tail, or a Winkelhaken's vertex
 * and the tips of its legs. `winkelhakenAngle` is the file's angle between a
 * Winkelhaken's legs, in degrees.
 */
export function shapeKeyPoints(
  shape: Shape,
  winkelhakenAngle: number,
): Point[] {
  switch (shape.kind) {
    case "wedge": {
      const start = flip(shape.start)
      return [start, pointAt(start, angle(shape.direction), shape.length)]
    }
    case "winkelhaken": {
      const vertex = flip(shape.vertex)
      const opening = angle(shape.direction)
      const half = (winkelhakenAngle / 2) * DEGREES
      return [
        vertex,
        pointAt(vertex, opening - half, shape.leg),
        pointAt(vertex, opening + half, shape.leg),
      ]
    }
  }
}

/** A skeleton's shapes as normalised features, ready for matching. */
export function prepareSkeleton(
  shapes: readonly Shape[],
  winkelhakenAngle: number,
): PreparedSample {
  return prepareSample(
    shapes.map(shapeFeature),
    shapes.flatMap((shape) => shapeKeyPoints(shape, winkelhakenAngle)),
  )
}

/** A shape's features, in the frame strokes are drawn in. */
function shapeFeature(shape: Shape): StrokeFeature {
  switch (shape.kind) {
    case "wedge": {
      const start = flip(shape.start)
      const direction = angle(shape.direction)
      return {
        kind: "wedge",
        position: midpoint(start, pointAt(start, direction, shape.length)),
        angle: direction,
        logLength: Math.log(shape.length),
      }
    }
    case "winkelhaken":
      return {
        kind: "winkelhaken",
        position: flip(shape.vertex),
        logSize: Math.log(shape.leg),
        opening: angle(shape.direction),
      }
  }
}

/** A point in the font's frame, in the frame strokes are drawn in. */
function flip({ x, y }: Point): Point {
  return { x, y: -y }
}

/** A direction in the font's frame, in radians as strokes are drawn. */
function angle(degrees: number): number {
  return wrapAngle(-degrees * DEGREES)
}
