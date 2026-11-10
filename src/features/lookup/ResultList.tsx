import type { LookupResult } from "@/core/lookup"
import { charsOf } from "@/core/signs"
import { ButtonWithInfo } from "@/ui/ButtonWithInfo/ButtonWithInfo"

import styles from "./ResultList.module.css"

/** Props for {@link ResultList}. */
export interface ResultListProps {
  results: readonly LookupResult[]
  onAppend: (result: LookupResult) => void
  /** Opens the result's Sign List entry. */
  onInfo: (result: LookupResult) => void
}

/**
 * Search results, best first, each with its characters and OSL name, and
 * the value or other name that matched when that isn't the OSL name.
 * Tapping a result appends it, and the ⓘ on its right opens its Sign List
 * entry instead.
 */
export function ResultList({ results, onAppend, onInfo }: ResultListProps) {
  return (
    <ul className={styles.list} aria-label="Results">
      {results.map((result) => {
        const { found, match } = result
        const { name } = found
        const chars = charsOf(found)
        return (
          <li key={`${found.kind} ${chars}`}>
            <ButtonWithInfo
              onPress={() => onAppend(result)}
              infoLabel={`About ${name}`}
              onInfo={() => onInfo(result)}
              infoPlacement="end"
            >
              <span className={styles.result}>
                <span className={styles.glyphs} aria-hidden="true">
                  {chars}
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
            </ButtonWithInfo>
          </li>
        )
      })}
    </ul>
  )
}
