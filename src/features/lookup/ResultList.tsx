import type { Ref } from "react"

import type { LookupResult } from "@/core/lookup"
import { charsOf } from "@/core/signs"
import { ActionList } from "@/ui/ActionList/ActionList"

import styles from "./ResultList.module.css"

/** Props for {@link ResultList}. */
export interface ResultListProps {
  results: readonly LookupResult[]
  onAppend: (result: LookupResult) => void
  /** Opens the result's Sign List entry. */
  onInfo: (result: LookupResult) => void
  /** Called when the up arrow key is pressed on the first result. */
  onArrowUpFromFirst?: () => void
  /** The list's element, for moving focus into it from the search field. */
  ref?: Ref<HTMLDivElement>
}

/**
 * Search results, best first, each with its characters and OSL name, and
 * the value or other name that matched when that isn't the OSL name.
 * Tapping a result appends it, and the ⓘ on its right opens its Sign List
 * entry instead.
 */
export function ResultList({
  results,
  onAppend,
  onInfo,
  onArrowUpFromFirst,
  ref,
}: ResultListProps) {
  const byId = new Map(results.map((result) => [idOf(result), result]))
  const items = results.map((result) => {
    const { found, match } = result
    const { name } = found
    const matched = match && match.text !== name ? match.text : undefined
    return {
      id: idOf(result),
      label: matched ? `${name} ${matched}` : name,
      infoLabel: `About ${name}`,
      content: (
        <span className={styles.result}>
          <span className={styles.glyphs} aria-hidden="true">
            {charsOf(found)}
          </span>
          <span className={styles.text}>
            <span className={styles.name}>{name}</span>
            {matched && (
              <>
                {" "}
                <span className={styles.match}>{matched}</span>
              </>
            )}
          </span>
        </span>
      ),
    }
  })
  return (
    <ActionList
      ref={ref}
      label="Results"
      onArrowUpFromFirst={onArrowUpFromFirst}
      items={items}
      onAction={(id) => onAppend(byId.get(id)!)}
      onInfo={(id) => onInfo(byId.get(id)!)}
    />
  )
}

function idOf({ found }: LookupResult): string {
  return `${found.kind} ${charsOf(found)}`
}
