import type { Box, Point } from "@/lib/geometry"

/**
 * The boundary between boxes nearest to a point, as the number of boxes
 * before it. The boxes are in reading order, left to right, and may wrap onto
 * several rows. The point belongs to the row nearest it vertically, and
 * within that row the boundaries are each box's left edge and the last box's
 * right edge, so a point past the end of a row is just after its last box.
 */
export function nearestBoundary(boxes: readonly Box[], point: Point): number {
  const row = nearestRow(boxes, point.y)
  if (row === undefined) return 0

  const last = row.at(-1)!
  const edges = [
    ...row.map((i) => ({ boundary: i, x: boxes[i]!.left })),
    { boundary: last + 1, x: boxes[last]!.right },
  ]
  const distance = (edge: { x: number }) => Math.abs(edge.x - point.x)
  return edges.reduce((best, edge) =>
    distance(edge) < distance(best) ? edge : best,
  ).boundary
}

/** The indices of the boxes in the row nearest to `y`, or undefined if there are none. */
function nearestRow(boxes: readonly Box[], y: number): number[] | undefined {
  const distance = (box: Box) => Math.max(box.top - y, y - box.bottom, 0)
  const nearest = boxes.reduce<Box | undefined>(
    (best, box) => (best && distance(best) <= distance(box) ? best : box),
    undefined,
  )
  if (!nearest) return undefined

  return boxes.flatMap((box, i) => (box.top === nearest.top ? [i] : []))
}
