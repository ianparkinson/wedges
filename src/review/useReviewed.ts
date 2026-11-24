import { useCallback } from "react"
import { useLocalStorage } from "usehooks-ts"

/** The marks for one skeleton file: which signs are reviewed, as they are now. */
export interface ReviewedMarks {
  /** Whether the sign is marked reviewed, with these shapes. */
  isReviewed: (text: string, shapes: readonly string[]) => boolean
  /** Marks or unmarks the sign, with these shapes. */
  setReviewed: (
    text: string,
    shapes: readonly string[],
    reviewed: boolean,
  ) => void
}

/**
 * Reviewed marks for a skeleton file, kept in this browser's local storage.
 * A mark holds the sign's shapes as they were when marked, so editing a
 * skeleton clears its mark.
 */
export function useReviewed(fileId: string): ReviewedMarks {
  const [marks, setMarks] = useLocalStorage<readonly string[]>(
    `wedges-reviewed-${fileId}`,
    [],
  )

  const isReviewed = useCallback(
    (text: string, shapes: readonly string[]) =>
      marks.includes(mark(text, shapes)),
    [marks],
  )
  const setReviewed = useCallback(
    (text: string, shapes: readonly string[], reviewed: boolean) => {
      const key = mark(text, shapes)
      setMarks((old) => [
        ...old.filter((m) => m !== key),
        ...(reviewed ? [key] : []),
      ])
    },
    [setMarks],
  )
  return { isReviewed, setReviewed }
}

/** A sign's characters and shapes, as one string. */
function mark(text: string, shapes: readonly string[]): string {
  return [text, ...shapes].join("|")
}
