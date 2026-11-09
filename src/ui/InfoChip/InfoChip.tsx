import { Chip } from "../Chip/Chip"
import { InfoIcon } from "../InfoIcon/InfoIcon"
import styles from "./InfoChip.module.css"

/** Props for {@link InfoChip}. */
export interface InfoChipProps {
  onPress: () => void
  /** The main text, which is cut short with … when the chip is too narrow. */
  label: string
  /** Quieter text after the label, cut short in the same way. */
  detail?: string
}

/**
 * A chip with an ⓘ, for opening more information about what it names. When
 * it shrinks to share a row its text is cut short, but the full text stays
 * in its accessible name.
 */
export function InfoChip({ onPress, label, detail }: InfoChipProps) {
  return (
    <Chip onPress={onPress}>
      <InfoIcon />
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {detail && (
          <>
            {" "}
            <span className={styles.detail}>{detail}</span>
          </>
        )}
      </span>
    </Chip>
  )
}
