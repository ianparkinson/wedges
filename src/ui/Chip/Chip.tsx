import type { ReactNode } from "react"
import { Button as AriaButton } from "react-aria-components"

import styles from "./Chip.module.css"

/** Props for {@link Chip}. */
export interface ChipProps {
  onPress: () => void
  /** An icon before the label, such as an `InfoIcon`. */
  icon?: ReactNode
  /** The main text, which is cut short with … when the chip is too wide. */
  label: string
  /** Quieter text after the label, cut short in the same way. */
  detail?: string
}

/**
 * A rounded button for a suggestion, as in a row above a phone's keyboard.
 * It is at most half its container's width, unless it is alone there.
 * Chips in a row too narrow for them shrink to share it, down to a few
 * letters of text each, before the row has to scroll. The full text stays in
 * its accessible name.
 */
export function Chip({ onPress, icon, label, detail }: ChipProps) {
  return (
    <AriaButton className={styles.chip} onPress={onPress}>
      {icon}
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {detail && (
          <>
            {" "}
            <span className={styles.detail}>{detail}</span>
          </>
        )}
      </span>
    </AriaButton>
  )
}
