import type { ReactNode } from "react"

import { Button } from "@/ui/Button/Button"
import { IconButton } from "@/ui/IconButton/IconButton"
import { InfoIcon } from "@/ui/InfoIcon/InfoIcon"

import styles from "./ButtonWithInfo.module.css"

/** Props for {@link ButtonWithInfo}. */
export interface ButtonWithInfoProps {
  onPress: () => void
  /** Draws the button with the accent colour, for the main choice among several. */
  isProminent?: boolean
  children: ReactNode
  /** The ⓘ's accessible name, such as "About AN". */
  infoLabel: string
  onInfo: () => void
  /**
   * Where the ⓘ sits: in the button's top right corner, or centred at its
   * end, with room kept for it so the content never runs under it.
   * Defaults to the corner.
   */
  infoPlacement?: "corner" | "end"
}

/**
 * A button that fills its container, with an ⓘ over it that does something
 * else, such as opening more about what the button picks. The ⓘ is a button
 * of its own beside the first, not inside it.
 */
export function ButtonWithInfo({
  onPress,
  isProminent = false,
  children,
  infoLabel,
  onInfo,
  infoPlacement = "corner",
}: ButtonWithInfoProps) {
  return (
    <div className={`${styles.wrapper} ${styles[infoPlacement]}`}>
      <Button onPress={onPress} isProminent={isProminent}>
        {children}
      </Button>
      <span className={styles.info}>
        <IconButton label={infoLabel} onPress={onInfo}>
          <InfoIcon />
        </IconButton>
      </span>
    </div>
  )
}
