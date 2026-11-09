import type { ReactNode } from "react"
import { Button as AriaButton } from "react-aria-components"

import styles from "./Chip.module.css"

/** Props for {@link Chip}. */
export interface ChipProps {
  onPress: () => void
  /** What the chip shows, laid out in a row. */
  children: ReactNode
  /** Keeps the chip at its content's width, rather than shrinking to share a row. */
  keepWidth?: boolean
  /** The accessible name, when the content doesn't say what the chip does. */
  "aria-label"?: string
}

/**
 * A rounded button for a suggestion, as in a row above a phone's keyboard.
 * It is at most half its container's width, unless it is alone there.
 * Chips in a row too narrow for them shrink to share it, down to a smallest
 * width, before the row has to scroll. `InfoChip` and `ReplacementChip` are
 * the kinds of chip there are.
 */
export function Chip({
  onPress,
  children,
  keepWidth,
  "aria-label": ariaLabel,
}: ChipProps) {
  return (
    <AriaButton
      className={keepWidth ? `${styles.chip} ${styles.keepWidth}` : styles.chip}
      onPress={onPress}
      aria-label={ariaLabel}
    >
      {children}
    </AriaButton>
  )
}
