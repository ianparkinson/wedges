import type { ReactNode } from "react"
import { Button as AriaButton } from "react-aria-components"

import styles from "./IconButton.module.css"

/** Props for {@link IconButton}. */
export interface IconButtonProps {
  /** The button's accessible name, since it shows only an icon. */
  label: string
  onPress: () => void
  /** The icon, such as an `InfoIcon`. */
  children: ReactNode
}

/**
 * A borderless button showing only an icon. It is touch-sized, however small
 * the icon, so place it where it has room around it.
 */
export function IconButton({ label, onPress, children }: IconButtonProps) {
  return (
    <AriaButton className={styles.button} aria-label={label} onPress={onPress}>
      {children}
    </AriaButton>
  )
}
