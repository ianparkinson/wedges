import type { ReactNode } from "react"

import styles from "./ButtonBar.module.css"

/** Props for {@link ButtonBar}. */
export interface ButtonBarProps {
  /** Buttons at the left-hand end, usually our `Button`s. */
  children: ReactNode
  /** The row's main button, at the right-hand end. */
  end: ReactNode
}

/**
 * A row of buttons: some at the left-hand end, and the main one at the
 * right. The main button is at least a set width, so the rows under the
 * text and the pad line up, and a label that changes doesn't shift it.
 */
export function ButtonBar({ children, end }: ButtonBarProps) {
  return (
    <div className={styles.bar}>
      {children}
      <div className={styles.end}>{end}</div>
    </div>
  )
}
