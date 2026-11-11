import type { Sign } from "@/core/signs"
import { ActionList } from "@/ui/ActionList/ActionList"
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
  const byChar = new Map(candidates.map((sign) => [sign.char, sign]))
  return (
    <section className={styles.panel} aria-label="Candidates">
      <ScreenReaderStatus message={announcement(candidates)} />
      {candidates.length > 0 ? (
        <div className={styles.list}>
          <ActionList
            label="Candidates"
            orientation="horizontal"
            items={candidates.map((sign, i) => ({
              id: sign.char,
              label: sign.name,
              infoLabel: `About ${sign.name}`,
              isProminent: i === 0,
              content: (
                <span className={styles.content}>
                  <span
                    className={
                      i === 0 ? `${styles.glyph} ${styles.best}` : styles.glyph
                    }
                    aria-hidden="true"
                  >
                    {sign.char}
                  </span>
                  <span className={styles.name}>{sign.name}</span>
                </span>
              ),
            }))}
            onAction={(char) => onPick(byChar.get(char)!)}
            onInfo={(char) => onInfo(byChar.get(char)!)}
          />
        </div>
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
