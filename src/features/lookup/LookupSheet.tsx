import { useMemo, useState } from "react"

import { buildIndex, search } from "@/core/lookup"
import { charsOf, type SignDatabase, type SignListEntry } from "@/core/signs"
import { SignInfo } from "@/features/signInfo/SignInfo"
import { Button } from "@/ui/Button/Button"
import { SearchField } from "@/ui/SearchField/SearchField"
import { Sheet } from "@/ui/Sheet/Sheet"

import styles from "./LookupSheet.module.css"
import { ResultList } from "./ResultList"

/** Props for {@link LookupSheet}. */
export interface LookupSheetProps {
  /** The sign signDatabase, or undefined until it has loaded. */
  signDatabase: SignDatabase | undefined
  isOpen: boolean
  onClose: () => void
  /** Adds characters to the text. The sheet closes after. */
  onAppend: (chars: string) => void
}

/**
 * Look up: search signs and sequences by name, value, code point or the
 * characters themselves. Tapping a result appends it, and its ⓘ opens its
 * Sign List entry, which can append it too. Appending clears the query. Closing
 * without appending keeps it, so the sheet opens again on the same results.
 */
export function LookupSheet({
  signDatabase,
  isOpen,
  onClose,
  onAppend,
}: LookupSheetProps) {
  const [query, setQuery] = useState("")
  const [opened, setOpened] = useState<SignListEntry>()

  const index = useMemo(
    () => signDatabase && buildIndex(signDatabase),
    [signDatabase],
  )
  const results = useMemo(
    () => (index ? search(index, query) : []),
    [index, query],
  )

  const close = () => {
    setOpened(undefined)
    onClose()
  }

  const append = (chars: string) => {
    onAppend(chars)
    setQuery("")
    close()
  }

  return (
    <Sheet isOpen={isOpen} onClose={close} title={opened?.name ?? "Look up"}>
      {opened && signDatabase ? (
        <div className={styles.view}>
          <div>
            <Button onPress={() => setOpened(undefined)}>
              Back to results
            </Button>
          </div>
          <SignInfo
            about={opened}
            signDatabase={signDatabase}
            onAppend={() => append(charsOf(opened))}
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
          {!signDatabase ? (
            <p className={styles.hint}>Loading signs…</p>
          ) : results.length > 0 ? (
            <ResultList
              results={results}
              onAppend={({ found }) => append(charsOf(found))}
              onInfo={({ found }) => setOpened(found)}
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
