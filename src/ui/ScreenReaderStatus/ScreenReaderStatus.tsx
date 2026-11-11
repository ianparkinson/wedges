import styles from "./ScreenReaderStatus.module.css"

/** Props for {@link ScreenReaderStatus}. */
export interface ScreenReaderStatusProps {
  /** What to say; screen readers announce it each time it changes. Empty says nothing. */
  message: string
}

/**
 * A status message for screen readers only, announced politely when it
 * changes. Use it for news that sighted people see elsewhere on the screen.
 */
export function ScreenReaderStatus({ message }: ScreenReaderStatusProps) {
  return (
    <span className={styles.status} role="status">
      {message}
    </span>
  )
}
