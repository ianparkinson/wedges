import type { Sign } from "@/core/signs"
import { ButtonWithInfo } from "@/ui/ButtonWithInfo/ButtonWithInfo"
import { ScreenReaderStatus } from "@/ui/ScreenReaderStatus/ScreenReaderStatus"

import styles from "./CandidateList.module.css"

/** Props for {@link CandidateList}. */
export interface CandidateListProps {
  /** The signs that best match the drawing, best first. */
  candidates: readonly Sign[]
  /** True until the sign data has loaded. */
  isLoading: boolean
  onPick: (sign: Sign) => void
  onInfo: (sign: Sign) => void
}

/**
 * The signs that best match the drawing, each with its glyph and name, the
 * best one largest. Tapping one picks it; the ⓘ in its corner opens its
 * entry instead. Screen readers hear the candidates' names as they change.
 */
export function CandidateList({
  candidates,
  isLoading,
  onPick,
  onInfo,
}: CandidateListProps) {
  return (
    <section className={styles.panel} aria-label="Candidates">
      <ScreenReaderStatus message={announcement(candidates)} />
      {candidates.length > 0 ? (
        <ul className={styles.list}>
          {candidates.map((sign, i) => (
            <li key={sign.char} className={styles.item}>
              <ButtonWithInfo
                onPress={() => onPick(sign)}
                isProminent={i === 0}
                infoLabel={`About ${sign.name}`}
                onInfo={() => onInfo(sign)}
              >
                <span className={styles.content}>
                  <span className={styles.glyph} aria-hidden="true">
                    {sign.char}
                  </span>
                  <span className={styles.name}>{sign.name}</span>
                </span>
              </ButtonWithInfo>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.hint}>
          {isLoading ? "Loading signs…" : "Draw a sign, one wedge at a time."}
        </p>
      )}
    </section>
  )
}

function announcement(candidates: readonly Sign[]): string {
  return candidates.length > 0
    ? `Candidates: ${candidates.map((sign) => sign.name).join(", ")}`
    : ""
}
