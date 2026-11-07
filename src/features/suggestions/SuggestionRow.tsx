import { useLayoutEffect, useRef } from "react"

import { clamp } from "@/core/geometry"
import type { Suggestions } from "@/core/suggest"
import {
  entryChars,
  entryName,
  entryValues,
  type SignListEntry,
} from "@/features/signInfo/signListEntry"
import { Chip } from "@/ui/Chip/Chip"
import { InfoIcon } from "@/ui/InfoIcon/InfoIcon"

import styles from "./SuggestionRow.module.css"

/** Props for {@link SuggestionRow}. */
export interface SuggestionRowProps {
  suggestions: Suggestions
  /** Opens an entry, when its chip is tapped. */
  onOpen: (entry: SignListEntry) => void
}

/**
 * A row of chips for the text before the cursor: the sign there, then each
 * sequence that ends there, each with its name and readings. Each chip opens
 * its entry. The row keeps its height when it is empty, so what is below it doesn't
 * move. When the chips don't fit, the row scrolls sideways, and goes back
 * to its start whenever they change. An edge with more chips beyond it
 * fades out.
 */
export function SuggestionRow({ suggestions, onOpen }: SuggestionRowProps) {
  const { sign, sequences } = suggestions
  const entries: SignListEntry[] = [
    ...(sign ? [{ kind: "sign" as const, sign }] : []),
    ...sequences.map((sequence) => ({ kind: "sequence" as const, sequence })),
  ]
  const rowRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row) return
    row.scrollLeft = 0
    setFades(row)
  }, [suggestions])

  return (
    <div
      ref={rowRef}
      className={styles.row}
      onScroll={(event) => setFades(event.currentTarget)}
      role="group"
      aria-label="Suggestions"
    >
      {entries.map((entry) => (
        <Chip
          key={`${entry.kind} ${entryChars(entry)}`}
          icon={<InfoIcon />}
          label={entryName(entry)}
          detail={entryValues(entry).join(", ")}
          onPress={() => onOpen(entry)}
        />
      ))}
    </div>
  )
}

/** How wide the fade is at an edge with more chips beyond it, in CSS pixels. */
const FADE_WIDTH = 24

/**
 * Sizes the fade at each end of the row to how far the row could scroll
 * that way, up to {@link FADE_WIDTH}, so a fade shrinks away smoothly as
 * the row scrolls to that end. They are set on the element directly, so
 * scrolling doesn't re-render the row.
 */
function setFades(row: HTMLElement) {
  const hiddenAfter = row.scrollWidth - row.clientWidth - row.scrollLeft
  const start = clamp(row.scrollLeft, 0, FADE_WIDTH)
  const end = clamp(hiddenAfter, 0, FADE_WIDTH)
  row.style.setProperty("--fade-start", `${start}px`)
  row.style.setProperty("--fade-end", `${end}px`)
}
