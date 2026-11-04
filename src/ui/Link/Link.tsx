import type { ReactNode } from "react"
import { Link as AriaLink } from "react-aria-components"

import styles from "./Link.module.css"

export interface LinkProps {
  href: string
  children: ReactNode
}

/**
 * A text link. External links (any absolute http(s) URL) open in a new tab
 * with rel="noopener noreferrer".
 */
export function Link({ href, children }: LinkProps) {
  const external = /^https?:\/\//.test(href)
  return (
    <AriaLink
      className={styles.link}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </AriaLink>
  )
}
