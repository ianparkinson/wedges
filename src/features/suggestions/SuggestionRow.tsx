import { useLayoutEffect, useRef } from "react"

import { charsOf, type SignDatabase, type SignListEntry } from "@/core/signs"
import type { Change, Suggestions } from "@/core/suggest"
import { clamp } from "@/lib/numbers"
import { InfoChip } from "@/ui/InfoChip/InfoChip"
import { ReplacementChip } from "@/ui/ReplacementChip/ReplacementChip"

import styles from "./SuggestionRow.module.css"

/** Props for {@link SuggestionRow}. */
export interface SuggestionRowProps {
  suggestions: Suggestions
  /** Opens the Sign List entry of a sign or sequence, when its chip is tapped. */
  onOpen: (listed: SignListEntry) => void
  /** Makes a change, when its chip is tapped. */
  onChange: (change: Change) => void
  /** Names the signs in the changes, for screen readers. */
  signDatabase: SignDatabase | undefined
}

/**
 * A row of chips for the text before the cursor. First come the sign there,
 * and each sequence that ends there, each with its name and readings; then
 * the changes that can be made there, each showing the signs it replaces, an
 * arrow, and what it puts in their place. A change's chip makes the change,
 * and the others open their Sign List entries. The row keeps its height when it is
 * empty, so what is below it doesn't move. When the chips don't fit, the row
 * scrolls sideways, and goes back to its start whenever they change. An edge
 * with more chips beyond it fades out.
 */
export function SuggestionRow({
  suggestions,
  onOpen,
  onChange,
  signDatabase,
}: SuggestionRowProps) {
  const { changes, sign, sequences } = suggestions
  const listed: SignListEntry[] = [...(sign ? [sign] : []), ...sequences]
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
      {listed.map((item) => (
        <InfoChip
          key={`${item.kind} ${charsOf(item)}`}
          label={item.name}
          detail={item.values.join(", ")}
          onPress={() => onOpen(item)}
        />
      ))}
      {changes.map((change) => (
        <ReplacementChip
          key={`${change.kind} ${change.chars}`}
          from={change.replaced}
          to={change.chars}
          aria-label={changeName(change, signDatabase)}
          onPress={() => onChange(change)}
        />
      ))}
    </div>
  )
}

const listFormat = new Intl.ListFormat("en")

/** What a change does, in words: Combine into |GA₂×AN|, or Split into GA₂ and AN. */
function changeName(
  { kind, chars }: Change,
  signDatabase: SignDatabase | undefined,
): string {
  const names = listFormat.format(
    [...chars].map((char) => signDatabase?.sign(char)?.name ?? char),
  )
  switch (kind) {
    case "combine":
      return `Combine into ${names}`
    case "swap":
      return `Swap for ${names}`
    case "split":
      return `Split into ${names}`
  }
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
