import type { ReactNode } from "react"
import { Button as AriaButton } from "react-aria-components"

import styles from "./Button.module.css"

/** Props for {@link Button}. */
export interface ButtonProps {
  onPress: () => void
  isDisabled?: boolean
  /** Draws the button with the accent colour, for the main choice among several. */
  isProminent?: boolean
  children: ReactNode
}

/** A push button, pressed by tap, click, Enter or Space. */
export function Button({
  onPress,
  isDisabled = false,
  isProminent = false,
  children,
}: ButtonProps) {
  return (
    <AriaButton
      className={
        isProminent ? `${styles.button} ${styles.prominent}` : styles.button
      }
      onPress={onPress}
      isDisabled={isDisabled}
    >
      {children}
    </AriaButton>
  )
}
