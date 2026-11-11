import styles from "./HelpIcon.module.css"

/** A question mark in a circle, the size of the text around it: it marks a way to help. */
export function HelpIcon() {
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
      <circle cx="10" cy="10" r="8" />
      <path d="M7.6 7.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.4v.6M10 14.2v.2" />
    </svg>
  )
}
