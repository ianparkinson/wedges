import type { ReactNode } from "react"
import { Button as AriaButton } from "react-aria-components"

import styles from "./Button.module.css"

/** Props for {@link Button}. */
export interface ButtonProps {
  onPress: () => void
  isDisabled?: boolean
  children: ReactNode
}

/** A push button, pressed by tap, click, Enter or Space. */
export function Button({ onPress, isDisabled = false, children }: ButtonProps) {
  return (
    <AriaButton
      className={styles.button}
      onPress={onPress}
      isDisabled={isDisabled}
    >
      {children}
    </AriaButton>
  )
}
