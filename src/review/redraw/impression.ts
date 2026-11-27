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
  /** The width of a tail's flat end and a Winkelhaken leg's tip. */
  readonly tailEnd: number
  /**
   * How a wedge's sides curve in from the head: its width above the tail
   * end falls with (1 - t) to this power, t running from 0 at the head to 1
   * at the end. 1 gives straight sides.
   */
  readonly taper: number
  /** A Winkelhaken leg's half width at the vertex, as a fraction of the leg. */
  readonly legWidth: number
  /**
   * The width of a headless line, for a font that draws ruled lines thinner
   * than a tail's end. Without it, a headless line is as wide as a tail's end.
   */
  readonly lineWidth?: number
}

/** Points along each side of a wedge, which make its curved sides. */
const WEDGE_STEPS = 16

/**
 * The outline of a shape as the font draws it, in the frame strokes are
 * drawn in, where y points down.
 */
export function impression(
  shape: Shape,
  winkelhakenAngle: number,
  style: StrokeStyle,
): Polygon {
  const [start, ...ends] = shapeKeyPoints(shape, winkelhakenAngle)
  switch (shape.kind) {
    case "wedge":
      return shape.head === 0 && style.lineWidth !== undefined
        ? wedgeOutline(start!, ends[0]!, 0, {
            ...style,
            tailEnd: style.lineWidth,
          })
        : wedgeOutline(start!, ends[0]!, shape.head, style)
    case "winkelhaken":
      return winkelhakenOutline(start!, ends[0]!, ends[1]!, style)
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

/**
 * A Winkelhaken as one outline of six points: each leg's two tip corners,
 * and the elbow's outer and inner corners, where the legs' outer sides meet
 * and where their inner sides meet.
 */
function winkelhakenOutline(
  vertex: Point,
  tip: Point,
  otherTip: Point,
  style: StrokeStyle,
): Polygon {
  const leg = legSides(vertex, tip, otherTip, style)
  const other = legSides(vertex, otherTip, tip, style)
  return [
    leg.outer[1],
    meeting(leg.outer, other.outer) ?? vertex,
    other.outer[1],
    other.inner[1],
    meeting(leg.inner, other.inner) ?? vertex,
    leg.inner[1],
  ]
}

/** A leg's two sides, each from the vertex out to the tip. */
interface LegSides {
  /** The side facing the other leg. */
  readonly inner: readonly [Point, Point]
  readonly outer: readonly [Point, Point]
}

function legSides(
  vertex: Point,
  tip: Point,
  otherTip: Point,
  { tailEnd, legWidth }: StrokeStyle,
): LegSides {
  const leg = distance(vertex, tip)
  const along = { x: (tip.x - vertex.x) / leg, y: (tip.y - vertex.y) / leg }
  const vertexHalf = Math.max(legWidth * leg, tailEnd / 2)
  const tipHalf = tailEnd / 2
  // Across the leg, towards the other one.
  const towards =
    (otherTip.x - vertex.x) * -along.y + (otherTip.y - vertex.y) * along.x > 0
      ? 1
      : -1
  const across = { x: -along.y * towards, y: along.x * towards }
  return {
    inner: [offset(vertex, across, vertexHalf), offset(tip, across, tipHalf)],
    outer: [offset(vertex, across, -vertexHalf), offset(tip, across, -tipHalf)],
  }
}

/** Where the lines through two sides meet, or undefined if they're parallel. */
function meeting(
  [p, p2]: readonly [Point, Point],
  [q, q2]: readonly [Point, Point],
): Point | undefined {
  const r = { x: p2.x - p.x, y: p2.y - p.y }
  const s = { x: q2.x - q.x, y: q2.y - q.y }
  const denominator = r.x * s.y - r.y * s.x
  if (denominator === 0) return undefined
  const t = ((q.x - p.x) * s.y - (q.y - p.y) * s.x) / denominator
  return offset(p, r, t)
}

function offset(p: Point, direction: Point, amount: number): Point {
  return { x: p.x + amount * direction.x, y: p.y + amount * direction.y }
}
