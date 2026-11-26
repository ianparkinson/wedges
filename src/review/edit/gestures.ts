/**
 * What the skeleton editor's drags and keys do to a shape, in the skeleton
 * file's frame.
 */
import type { Shape } from "@/core/skeleton"
import type { Point } from "@/lib/geometry"

import {
  lengthenShape,
  moveShape,
  openWinkelhaken,
  pointShape,
  traceLeg,
  turnShape,
  widenHead,
  type HandleRole,
} from "./shapeEdits"

/**
 * What a drag changes: the whole shape's place, what a handle sets, or, for
 * a shape being drawn, a wedge's tail or a Winkelhaken's traced leg.
 */
export type DragRole = HandleRole | "move" | "draw"

/** How far the arrow keys move, and the - and = keys lengthen, with Shift. */
const BIG_STEP = 5
/** How far [ and ] turn a shape with Shift, in degrees. */
const BIG_TURN = 15

/** How the keys held during a drag change it. */
export interface DragKeys {
  /** Whether directions and angles snap: true unless Alt is held. */
  readonly snap: boolean
  /** Whether a Winkelhaken being drawn opens to the other side of the traced leg: Shift. */
  readonly mirror: boolean
}

/**
 * The shape a drag makes, from `shape` as it was when the drag began at
 * `from`, now at `to`.
 */
export function dragged(
  role: DragRole,
  shape: Shape,
  from: Point,
  to: Point,
  { snap, mirror }: DragKeys,
  winkelhakenAngle: number,
): Shape {
  switch (role) {
    case "move":
      return moveShape(shape, to.x - from.x, to.y - from.y)
    case "draw":
      return drawn(shape, to, snap, mirror, winkelhakenAngle)
    case "point":
      return pointedBy(shape, to, snap, winkelhakenAngle)
    case "head":
      return shape.kind === "wedge" ? widenHead(shape, to) : shape
    case "angle":
      return shape.kind === "winkelhaken"
        ? openWinkelhaken(shape, to, winkelhakenAngle, snap)
        : shape
  }
}

/** A new shape drawn to `to`: a wedge's tail end, or the tip of a Winkelhaken's leg. */
function drawn(
  shape: Shape,
  to: Point,
  snap: boolean,
  mirror: boolean,
  winkelhakenAngle: number,
): Shape {
  switch (shape.kind) {
    case "wedge":
      return pointShape(shape, to, snap)
    case "winkelhaken":
      return traceLeg(shape, to, winkelhakenAngle, snap, mirror)
  }
}

/**
 * The shape its point handle makes, which sets where it points and how long
 * it is: a wedge's tail end, or a Winkelhaken's traced leg.
 */
function pointedBy(
  shape: Shape,
  to: Point,
  snap: boolean,
  winkelhakenAngle: number,
): Shape {
  switch (shape.kind) {
    case "wedge":
      return pointShape(shape, to, snap)
    case "winkelhaken":
      return traceLeg(shape, to, winkelhakenAngle, snap)
  }
}

/**
 * The shape a key makes: the arrow keys move it, [ and ] turn it, and - and
 * = shorten and lengthen it, by more with `big`. Undefined for any other key.
 */
export function keyed(
  shape: Shape,
  key: string,
  big: boolean,
): Shape | undefined {
  const step = big ? BIG_STEP : 1
  const turn = big ? BIG_TURN : 1
  switch (key) {
    case "ArrowLeft":
      return moveShape(shape, -step, 0)
    case "ArrowRight":
      return moveShape(shape, step, 0)
    case "ArrowUp":
      return moveShape(shape, 0, step)
    case "ArrowDown":
      return moveShape(shape, 0, -step)
    case "[":
    case "{":
      return turnShape(shape, turn)
    case "]":
    case "}":
      return turnShape(shape, -turn)
    case "-":
    case "_":
      return lengthenShape(shape, -step)
    case "=":
    case "+":
      return lengthenShape(shape, step)
    default:
      return undefined
  }
}
