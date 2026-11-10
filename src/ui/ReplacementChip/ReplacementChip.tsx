import { ArrowIcon } from "@/ui/ArrowIcon/ArrowIcon"
import { Chip } from "@/ui/Chip/Chip"

import styles from "./ReplacementChip.module.css"

/** Props for {@link ReplacementChip}. */
export interface ReplacementChipProps {
  onPress: () => void
  /** The cuneiform signs the chip replaces. */
  from: string
  /** The cuneiform signs it puts in their place. */
  to: string
  /** What the chip does, in words, since its signs don't say. */
  "aria-label": string
}

/**
 * A chip that replaces some signs with others, showing the signs, an arrow,
 * and their replacement. It keeps its full width.
 */
export function ReplacementChip({
  onPress,
  from,
  to,
  "aria-label": ariaLabel,
}: ReplacementChipProps) {
  return (
    <Chip onPress={onPress} keepWidth aria-label={ariaLabel}>
      <span className={styles.signs}>{from}</span>
      <ArrowIcon />
      <span className={styles.signs}>{to}</span>
    </Chip>
  )
}
