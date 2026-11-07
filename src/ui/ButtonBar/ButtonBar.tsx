import type { ReactNode } from "react"

import styles from "./ButtonBar.module.css"

/** Props for {@link ButtonBar}. */
export interface ButtonBarProps {
  /** Buttons, usually our `Button`s. */
  children: ReactNode
}

/**
 * A row of buttons that fills its width, like the keys along the bottom of a
 * phone keyboard. Each button grows by the same amount from the width of its
 * label.
 */
export function ButtonBar({ children }: ButtonBarProps) {
  return <div className={styles.bar}>{children}</div>
}
