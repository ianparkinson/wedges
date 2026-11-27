/**
 * Changes to a single shape, as the review page's editor makes them, all in
 * the skeleton file's frame: y points up, and directions are in degrees
 * anticlockwise from rightwards. Every number comes out whole, as skeleton
 * files keep them.
 */
import type { Shape, WedgeShape, WinkelhakenShape } from "@/core/skeleton"
import { direction, distance, type Point } from "@/lib/geometry"
import { clamp } from "@/lib/numbers"

/** How close a direction must be to a multiple of 45° to snap to it. */
const SNAP_DEGREES = 7
/** How close a Winkelhaken's angle must be to the file's to drop its own. */
const FILE_ANGLE_SNAP = 3
const MIN_ANGLE = 20
const MAX_ANGLE = 170
const DEGREES = 180 / Math.PI

/** A shape as a skeleton file writes it, such as "w 21 69 270 77 15". */
export function formatShape(shape: Shape): string {
  switch (shape.kind) {
    case "wedge": {
      const { start, direction, length, head } = shape
      return `w ${start.x} ${start.y} ${direction} ${length} ${head}`
    }
    case "winkelhaken": {
      const { vertex, direction, leg, angle } = shape
      const own = angle === undefined ? "" : ` ${angle}`
      return `k ${vertex.x} ${vertex.y} ${direction} ${leg}${own}`
    }
  }
}

/** A shape's start: a wedge's head, or a Winkelhaken's vertex. */
export function shapeStart(shape: Shape): Point {
  switch (shape.kind) {
    case "wedge":
      return shape.start
    case "winkelhaken":
      return shape.vertex
  }
}

/** The shape moved by `dx` and `dy`. */
export function moveShape(shape: Shape, dx: number, dy: number): Shape {
  const start = shapeStart(shape)
  const moved = { x: Math.round(start.x + dx), y: Math.round(start.y + dy) }
  switch (shape.kind) {
    case "wedge":
      return { ...shape, start: moved }
    case "winkelhaken":
      return { ...shape, vertex: moved }
  }
}

/**
 * The shape pointed at `to` from its start: a wedge's tail reaching it, or a
 * Winkelhaken opening towards it with legs as long as the distance to it.
 * With `snap`, a direction near a multiple of 45° becomes that multiple.
 */
export function pointShape(shape: Shape, to: Point, snap: boolean): Shape {
  const aimed = aimShape(shape, to, snap)
  const length = Math.max(1, Math.round(distance(shapeStart(shape), to)))
  switch (aimed.kind) {
    case "wedge":
      return { ...aimed, length }
    case "winkelhaken":
      return { ...aimed, leg: length }
  }
}

/**
 * The shape turned about its start to point towards `to`, keeping its
 * length. With `snap`, a direction near a multiple of 45° becomes that
 * multiple.
 */
function aimShape(shape: Shape, to: Point, snap: boolean): Shape {
  const degrees = direction(shapeStart(shape), to) * DEGREES
  return {
    ...shape,
    direction: snap ? snapDirection(degrees) : wholeDegrees(degrees),
  }
}

/** The wedge with its head's back edge reaching out to `to` on either side. */
export function widenHead(shape: WedgeShape, to: Point): WedgeShape {
  const across = (shape.direction + 90) / DEGREES
  const offset =
    (to.x - shape.start.x) * Math.cos(across) +
    (to.y - shape.start.y) * Math.sin(across)
  return { ...shape, head: Math.round(2 * Math.abs(offset)) }
}

/**
 * A Winkelhaken turned and resized by its traced leg, the one on the
 * anticlockwise side of the direction it opens towards: the upper leg of one
 * that opens right. The leg is traced from the vertex to `to`, and its
 * length becomes the length of both legs; the angle between them stays. With
 * `mirror`, the traced leg is the other one. `fileAngle` is the file's angle
 * between a Winkelhaken's legs. With `snap`, the direction it opens towards
 * snaps to a multiple of 45° when it's near one.
 */
export function traceLeg(
  shape: WinkelhakenShape,
  to: Point,
  fileAngle: number,
  snap: boolean,
  mirror = false,
): WinkelhakenShape {
  const half = (shape.angle ?? fileAngle) / 2
  const legDirection = direction(shape.vertex, to) * DEGREES
  const opening = legDirection + (mirror ? half : -half)
  return {
    ...shape,
    direction: snap ? snapDirection(opening) : wholeDegrees(opening),
    leg: Math.max(1, Math.round(distance(shape.vertex, to))),
  }
}

/**
 * The Winkelhaken opened by moving its other leg, the one clockwise of the
 * direction it opens towards, to point at `to`. The traced leg (see
 * {@link traceLeg}) and the legs' length stay, and the direction it opens
 * towards moves to halfway between the legs. An angle within a few degrees
 * of `fileAngle`, the file's angle for every Winkelhaken, becomes the file's,
 * unless `snap` is false.
 */
export function openWinkelhaken(
  shape: WinkelhakenShape,
  to: Point,
  fileAngle: number,
  snap: boolean,
): WinkelhakenShape {
  const traced = shape.direction + (shape.angle ?? fileAngle) / 2
  const fromTraced = wrapDegrees(traced - direction(shape.vertex, to) * DEGREES)
  const angle = Math.round(clamp(fromTraced, MIN_ANGLE, MAX_ANGLE))
  const { kind, vertex, leg } = shape
  const sameAsFile = snap && Math.abs(angle - fileAngle) <= FILE_ANGLE_SNAP
  const opened = sameAsFile ? fileAngle : angle
  const plain = {
    kind,
    vertex,
    direction: wholeDegrees(traced - opened / 2),
    leg,
  }
  return sameAsFile ? plain : { ...plain, angle }
}

/** The shape turned anticlockwise by `degrees` about its start. */
export function turnShape(shape: Shape, degrees: number): Shape {
  return { ...shape, direction: wholeDegrees(shape.direction + degrees) }
}

/** The shape's tail, or each leg, made longer by `by`, never shorter than 1. */
export function lengthenShape(shape: Shape, by: number): Shape {
  switch (shape.kind) {
    case "wedge":
      return { ...shape, length: Math.max(1, shape.length + by) }
    case "winkelhaken":
      return { ...shape, leg: Math.max(1, shape.leg + by) }
  }
}

/** A direction in whole degrees from 0 to 359, snapped to a multiple of 45° if it's near one. */
export function snapDirection(degrees: number): number {
  const nearest = Math.round(degrees / 45) * 45
  return wholeDegrees(
    Math.abs(degrees - nearest) <= SNAP_DEGREES ? nearest : degrees,
  )
}

/** A direction in whole degrees from 0 to 359. */
function wholeDegrees(degrees: number): number {
  return ((Math.round(degrees) % 360) + 360) % 360
}

/** An angle in degrees, moved by whole turns into the range -180 to 180. */
function wrapDegrees(degrees: number): number {
  return degrees - 360 * Math.round(degrees / 360)
}

/**
 * What dragging a handle changes: where a shape points and how long it is,
 * from a wedge's tail end or a Winkelhaken's traced leg; a wedge's head
 * width; or how far a Winkelhaken opens, from its other leg.
 */
export type HandleRole = "point" | "head" | "angle"

/** A point to drag to change a shape, in the skeleton file's frame. */
export interface Handle {
  readonly role: HandleRole
  readonly at: Point
}

/**
 * A shape's handles: a wedge's tail end and one end of its head's back edge,
 * or the tips of a Winkelhaken's traced leg and its other leg (see
 * {@link traceLeg} and {@link openWinkelhaken}). `winkelhakenAngle` is the
 * file's angle between a Winkelhaken's legs.
 */
export function shapeHandles(shape: Shape, winkelhakenAngle: number): Handle[] {
  switch (shape.kind) {
    case "wedge":
      return [
        {
          role: "point",
          at: along(shape.start, shape.direction, shape.length),
        },
        {
          role: "head",
          at: along(shape.start, shape.direction + 90, shape.head / 2),
        },
      ]
    case "winkelhaken": {
      const half = (shape.angle ?? winkelhakenAngle) / 2
      return [
        {
          role: "point",
          at: along(shape.vertex, shape.direction + half, shape.leg),
        },
        {
          role: "angle",
          at: along(shape.vertex, shape.direction - half, shape.leg),
        },
      ]
    }
  }
}

/** The point `length` from `start` in a direction in degrees. */
function along(start: Point, degrees: number, length: number): Point {
  return {
    x: start.x + length * Math.cos(degrees / DEGREES),
    y: start.y + length * Math.sin(degrees / DEGREES),
  }
}
