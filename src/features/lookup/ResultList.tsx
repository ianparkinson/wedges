import type { LookupResult } from "@/core/lookup"
import { Button } from "@/ui/Button/Button"
import { IconButton } from "@/ui/IconButton/IconButton"
import { InfoIcon } from "@/ui/InfoIcon/InfoIcon"

import styles from "./ResultList.module.css"

/** Props for {@link ResultList}. */
export interface ResultListProps {
  results: readonly LookupResult[]
  onAppend: (result: LookupResult) => void
  /** Opens the result's entry. */
  onInfo: (result: LookupResult) => void
}

/**
 * Search results, best first, each with its characters and OSL name, and
 * the value or other name that matched when that isn't the OSL name.
 * Tapping a result appends it, and the ⓘ on its right opens its entry
 * instead.
 */
export function ResultList({ results, onAppend, onInfo }: ResultListProps) {
  return (
    <ul className={styles.list} aria-label="Results">
      {results.map((result) => {
        const { entry, match } = result
        const [name] = entry.names
        return (
          <li key={`${entry.kind} ${entry.chars}`} className={styles.item}>
            <Button onPress={() => onAppend(result)}>
              <span className={styles.result}>
                <span className={styles.glyphs} aria-hidden="true">
                  {entry.chars}
                </span>
                <span className={styles.text}>
                  <span className={styles.name}>{name}</span>
                  {match && match.text !== name && (
                    <>
                      {" "}
                      <span className={styles.match}>{match.text}</span>
                    </>
                  )}
                </span>
              </span>
            </Button>
            <span className={styles.info}>
              <IconButton
                label={`About ${name}`}
                onPress={() => onInfo(result)}
              >
                <InfoIcon />
              </IconButton>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
