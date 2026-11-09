import styles from "./ArrowIcon.module.css"

/** An arrow pointing right, the size of the text around it: what is before it becomes what is after it. */
export function ArrowIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10h14M12 5l5 5-5 5" />
    </svg>
  )
}
