import type { Sign } from "@/core/signs"
import { Button } from "@/ui/Button/Button"

import styles from "./AcceptButton.module.css"

/** Props for {@link AcceptButton}. */
export interface AcceptButtonProps {
  /** The best candidate, or undefined when there are none. */
  best: Sign | undefined
  onPick: (sign: Sign) => void
}

/**
 * Picks the best candidate, showing its glyph. The glyph has a slot of its
 * own width, so the button stays the same width whichever sign it shows;
 * a wide sign is cut off at the slot's edges.
 */
export function AcceptButton({ best, onPick }: AcceptButtonProps) {
  return (
    <Button onPress={() => best && onPick(best)} isDisabled={!best} isProminent>
      <span className={styles.content}>
        Accept
        <span className={styles.glyph} aria-hidden="true">
          {best?.char}
        </span>
      </span>
    </Button>
  )
}
