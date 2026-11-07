import styles from "./InfoIcon.module.css"

/** An ⓘ in a circle, the size of the text around it: it marks a way to more information. */
export function InfoIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9v5M10 6.2v.2" />
    </svg>
  )
}
