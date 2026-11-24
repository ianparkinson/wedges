/**
 * Skeleton shapes drawn the way a font draws its strokes, to lay over the
 * font's glyphs. Skeleton files don't record stroke widths, so each font's
 * {@link StrokeStyle} is kept here.
 */
import { shapeKeyPoints, type Shape } from "@/core/skeleton"
import { distance, type Point, type Polygon } from "@/lib/geometry"

/**
 * How a tapered font draws its strokes, in skeleton units (1 em = 100). A
 * wedge narrows from its head to the flat end of its tail, and each leg of a
 * Winkelhaken narrows from the vertex to its tip.
 */
export interface StrokeStyle {
  /** The width of a tail's flat end, a Winkelhaken leg's tip, and a headless line. */
  readonly tailEnd: number
  /**
   * How a wedge's sides curve in from the head: its width above the tail
   * end falls with (1 - t) to this power, t running from 0 at the head to 1
   * at the end. 1 gives straight sides.
   */
  readonly taper: number
  /** A Winkelhaken leg's half width at the vertex, as a fraction of the leg. */
  readonly legWidth: number
}

/** How far a Winkelhaken's legs reach back past the vertex, as a fraction of their half width there, to fill the elbow. */
const ELBOW_FILL = 0.8

/** Points along each side of a wedge, which make its curved sides. */
const WEDGE_STEPS = 16

/**
 * The outline of a shape as the font draws it, in the frame strokes are
 * drawn in, where y points down: one polygon for a wedge, one for each leg
 * of a Winkelhaken.
 */
export function impression(
  shape: Shape,
  winkelhakenAngle: number,
  style: StrokeStyle,
): Polygon[] {
  const [start, ...ends] = shapeKeyPoints(shape, winkelhakenAngle)
  switch (shape.kind) {
    case "wedge":
      return [wedgeOutline(start!, ends[0]!, shape.head, style)]
    case "winkelhaken":
      return ends.map((tip) => legOutline(start!, tip, style))
  }
}

function wedgeOutline(
  start: Point,
  end: Point,
  head: number,
  { tailEnd, taper }: StrokeStyle,
): Polygon {
  const length = distance(start, end)
  const along = { x: (end.x - start.x) / length, y: (end.y - start.y) / length }
  const across = { x: -along.y, y: along.x }
  const headHalf = Math.max(head, tailEnd) / 2
  const tailHalf = tailEnd / 2

  const spine = Array.from({ length: WEDGE_STEPS + 1 }, (_, i) => {
    const t = i / WEDGE_STEPS
    return {
      centre: offset(start, along, t * length),
      half: tailHalf + (headHalf - tailHalf) * (1 - t) ** taper,
    }
  })
  return [
    ...spine.map(({ centre, half }) => offset(centre, across, half)),
    ...spine
      .toReversed()
      .map(({ centre, half }) => offset(centre, across, -half)),
  ]
}

function legOutline(
  vertex: Point,
  tip: Point,
  { tailEnd, legWidth }: StrokeStyle,
): Polygon {
  const leg = distance(vertex, tip)
  const along = { x: (tip.x - vertex.x) / leg, y: (tip.y - vertex.y) / leg }
  const across = { x: -along.y, y: along.x }
  const vertexHalf = Math.max(legWidth * leg, tailEnd / 2)
  const tipHalf = tailEnd / 2
  const back = offset(vertex, along, -ELBOW_FILL * vertexHalf)
  return [
    offset(back, across, vertexHalf),
    offset(tip, across, tipHalf),
    offset(tip, across, -tipHalf),
    offset(back, across, -vertexHalf),
  ]
}

function offset(p: Point, direction: Point, amount: number): Point {
  return { x: p.x + amount * direction.x, y: p.y + amount * direction.y }
}
