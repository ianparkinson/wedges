import type { Sign } from "@/core/signs"
import { Button } from "@/ui/Button/Button"

import styles from "./CandidateList.module.css"

/** Props for {@link CandidateList}. */
export interface CandidateListProps {
  /** The signs that best match the drawing, best first. */
  candidates: readonly Sign[]
  /** True until the sign data has loaded. */
  isLoading: boolean
  onPick: (sign: Sign) => void
}

/**
 * The signs that best match the drawing, each with its glyph and name, the
 * best one largest. Tapping one picks it, and Accept best picks the best.
 */
export function CandidateList({
  candidates,
  isLoading,
  onPick,
}: CandidateListProps) {
  const [best] = candidates
  return (
    <section className={styles.panel} aria-label="Candidates">
      {candidates.length > 0 ? (
        <ul className={styles.list}>
          {candidates.map((sign, i) => (
            <li key={sign.char} className={styles.item}>
              <Button onPress={() => onPick(sign)} isProminent={i === 0}>
                <span className={styles.glyph} aria-hidden="true">
                  {sign.char}
                </span>
                <span className={styles.name}>{sign.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.hint}>
          {isLoading ? "Loading signs…" : "Draw a sign, one wedge at a time."}
        </p>
      )}
      <Button onPress={() => best && onPick(best)} isDisabled={!best}>
        Accept best
      </Button>
    </section>
  )
}
