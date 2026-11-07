import { useMemo, useState } from "react"

import { buildIndex, search } from "@/core/lookup"
import type { SignDatabase } from "@/core/signs"
import { SignInfo } from "@/features/signInfo/SignInfo"
import {
  entryChars,
  entryName,
  findSignListEntry,
  type SignListEntry,
} from "@/features/signInfo/signListEntry"
import { Button } from "@/ui/Button/Button"
import { SearchField } from "@/ui/SearchField/SearchField"
import { Sheet } from "@/ui/Sheet/Sheet"

import styles from "./LookupSheet.module.css"
import { ResultList } from "./ResultList"

/** Props for {@link LookupSheet}. */
export interface LookupSheetProps {
  /** The sign database, or undefined until it has loaded. */
  database: SignDatabase | undefined
  isOpen: boolean
  onClose: () => void
  /** Adds characters to the text. The sheet closes after. */
  onAppend: (chars: string) => void
}

/**
 * Look up: search signs and sequences by name, value, code point or the
 * characters themselves. Tapping a result appends it, and its ⓘ opens its
 * entry, which can append it too. The query is kept while the sheet is closed, so it opens again
 * on the same results.
 */
export function LookupSheet({
  database,
  isOpen,
  onClose,
  onAppend,
}: LookupSheetProps) {
  const [query, setQuery] = useState("")
  const [entry, setEntry] = useState<SignListEntry>()

  const index = useMemo(
    () => database && buildIndex(database.lookupEntries),
    [database],
  )
  const results = useMemo(
    () =>
      index && database
        ? search(index, query).filter((r) =>
            findSignListEntry(database, r.entry),
          )
        : [],
    [database, index, query],
  )

  const close = () => {
    setEntry(undefined)
    onClose()
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={close}
      title={entry ? entryName(entry) : "Look up"}
    >
      {entry && database ? (
        <div className={styles.view}>
          <div>
            <Button onPress={() => setEntry(undefined)}>Back to results</Button>
          </div>
          <SignInfo
            entry={entry}
            database={database}
            onAppend={() => {
              onAppend(entryChars(entry))
              close()
            }}
          />
        </div>
      ) : (
        <div className={styles.view}>
          <SearchField
            label="Name, value, code point or sign"
            value={query}
            onChange={setQuery}
            autoFocus
          />
          {!database ? (
            <p className={styles.hint}>Loading signs…</p>
          ) : results.length > 0 ? (
            <ResultList
              results={results}
              onAppend={(result) => {
                onAppend(result.entry.chars)
                close()
              }}
              onInfo={(result) =>
                setEntry(findSignListEntry(database, result.entry))
              }
            />
          ) : (
            <p className={styles.hint}>
              {query.trim()
                ? "Nothing found."
                : "Type a name or value, such as ša or sza for ŠA, or paste signs."}
            </p>
          )}
        </div>
      )}
    </Sheet>
  )
}
