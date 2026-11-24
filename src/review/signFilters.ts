/**
 * Filtering and sorting the review page's signs.
 */
import { isChanged } from "./compare"
import type { RedrawLimits } from "./redraw/limits"
import type { ReviewSign } from "./reviewSigns"
import type { ReviewedMarks } from "./useReviewed"

/** The statuses the page can filter by. */
export const STATUSES = [
  "all",
  "traced",
  "untraced",
  "unreviewed",
  "reviewed",
  "failing",
  "changed",
] as const

/** A status the page can filter by. */
export type Status = (typeof STATUSES)[number]

/** The orders the page can sort by. */
export const SORTS = ["file", "overlap", "shape outside"] as const

/** An order the page can sort by. */
export type Sort = (typeof SORTS)[number]

/**
 * Whether a sign has one of the {@link STATUSES}: "changed" means changed
 * from the version compared with.
 */
export function hasStatus(
  sign: ReviewSign,
  status: Status,
  reviewed: ReviewedMarks,
  limits: RedrawLimits | undefined,
): boolean {
  switch (status) {
    case "traced":
      return sign.shapes !== undefined
    case "untraced":
      return sign.shapes === undefined
    case "reviewed":
      return (
        sign.shapes !== undefined && reviewed.isReviewed(sign.text, sign.shapes)
      )
    case "unreviewed":
      return (
        sign.shapes !== undefined &&
        !reviewed.isReviewed(sign.text, sign.shapes)
      )
    case "failing":
      return isFailing(sign, limits)
    case "changed":
      return isChanged(sign)
    case "all":
      return true
  }
}

/** Whether a sign falls outside the limits the data test holds it to. */
export function isFailing(
  sign: ReviewSign,
  limits: RedrawLimits | undefined,
): boolean {
  const score = sign.score
  if (!limits || !score) return false
  return (
    score.overlap < limits.overlap ||
    score.shapesOutside.some((outside) => outside > limits.shapeOutside)
  )
}

/** Signs in file order, or the worst first by overlap or by their worst shape. */
export function sortSigns(
  signs: readonly ReviewSign[],
  sort: Sort,
): ReviewSign[] {
  switch (sort) {
    case "overlap":
      return signs.toSorted(
        (a, b) => (a.score?.overlap ?? 2) - (b.score?.overlap ?? 2),
      )
    case "shape outside":
      return signs.toSorted((a, b) => worstShape(b) - worstShape(a))
    case "file":
      return [...signs]
  }
}

function worstShape(sign: ReviewSign): number {
  return Math.max(-1, ...(sign.score?.shapesOutside ?? []))
}
