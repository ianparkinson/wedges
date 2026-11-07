import { useMemo, useState } from "react"

import { rank } from "@/core/matcher/rank"
import type { Sign } from "@/core/signs"
import type { Stroke } from "@/core/strokes"
import { suggestionsAt } from "@/core/suggest"
import { AcceptButton } from "@/features/candidates/AcceptButton"
import { CandidateList } from "@/features/candidates/CandidateList"
import { DrawingPanel } from "@/features/drawing/DrawingPanel"
import { LookupSheet } from "@/features/lookup/LookupSheet"
import { SequencePanel } from "@/features/sequence/SequencePanel"
import { useSequence } from "@/features/sequence/useSequence"
import { SignInfoSheet } from "@/features/signInfo/SignInfoSheet"
import type { SignListEntry } from "@/features/signInfo/signListEntry"
import { SuggestionRow } from "@/features/suggestions/SuggestionRow"
import { Button } from "@/ui/Button/Button"
import { Link } from "@/ui/Link/Link"

import styles from "./App.module.css"
import { useSignDatabase } from "./useSignDatabase"

const REPO_URL = "https://github.com/ianparkinson/wedges"

/** How many candidates the app shows for a drawing. */
const CANDIDATE_COUNT = 3

/**
 * An entry shown in a sheet over the app, and the candidate its Append
 * picks, when it was opened from a candidate.
 */
interface ShownEntry {
  readonly entry: SignListEntry
  readonly append?: Sign
}

/**
 * The app shell: the text written so far, suggestions for the signs before
 * the cursor, the drawing pad, and the candidates for what is drawn on it,
 * with Look up and entries in sheets over them.
 */
export function App() {
  const database = useSignDatabase()
  const [strokes, setStrokes] = useState<readonly Stroke[]>([])
  const [sequence, editSequence] = useSequence()
  const [isLookupOpen, setLookupOpen] = useState(false)
  const [shownEntry, setShownEntry] = useState<ShownEntry>()

  const candidates = useMemo(
    () =>
      database
        ? rank(strokes, database.drawable, { limit: CANDIDATE_COUNT }).map(
            (ranked) => ranked.sign,
          )
        : [],
    [database, strokes],
  )

  const suggestions = useMemo(
    () =>
      database
        ? suggestionsAt(sequence, database)
        : { sign: undefined, sequences: [] },
    [database, sequence],
  )

  const pick = (sign: Sign) => {
    editSequence({ kind: "insert", chars: sign.char })
    setStrokes([])
  }
  const appendShown = shownEntry?.append

  return (
    <main className={styles.page}>
      <div className={styles.screen}>
        <header className={styles.header}>
          <h1 className={styles.title}>Wedges</h1>
          <Button onPress={() => setLookupOpen(true)}>Look up</Button>
        </header>
        <SequencePanel
          sequence={sequence}
          onAction={editSequence}
          nameOf={(char) => database?.sign(char)?.name}
        />
        <SuggestionRow
          suggestions={suggestions}
          onOpen={(entry) => setShownEntry({ entry })}
        />
        <DrawingPanel strokes={strokes} onStrokesChange={setStrokes}>
          <AcceptButton best={candidates[0]} onPick={pick} />
        </DrawingPanel>
        <CandidateList
          candidates={candidates}
          isLoading={!database}
          onPick={pick}
          onInfo={(sign) =>
            setShownEntry({ entry: { kind: "sign", sign }, append: sign })
          }
        />
      </div>
      <p className={styles.footer}>
        Wedges is being built. Follow along on{" "}
        <Link href={REPO_URL}>GitHub</Link>.
      </p>
      <LookupSheet
        database={database}
        isOpen={isLookupOpen}
        onClose={() => setLookupOpen(false)}
        onAppend={(chars) => editSequence({ kind: "insert", chars })}
      />
      {database && (
        <SignInfoSheet
          entry={shownEntry?.entry}
          database={database}
          onClose={() => setShownEntry(undefined)}
          {...(appendShown && { onAppend: () => pick(appendShown) })}
        />
      )}
    </main>
  )
}
