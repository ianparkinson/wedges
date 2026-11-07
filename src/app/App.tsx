import { useMemo, useState } from "react"

import { rank } from "@/core/matcher/rank"
import type { Sign } from "@/core/signs"
import type { Stroke } from "@/core/strokes"
import { CandidateList } from "@/features/candidates/CandidateList"
import { DrawingPanel } from "@/features/drawing/DrawingPanel"
import { SequencePanel } from "@/features/sequence/SequencePanel"
import { useSequence } from "@/features/sequence/useSequence"
import { Link } from "@/ui/Link/Link"

import styles from "./App.module.css"
import { useSignDatabase } from "./useSignDatabase"

const REPO_URL = "https://github.com/ianparkinson/wedges"

/** How many candidates the app shows for a drawing. */
const CANDIDATE_COUNT = 3

/**
 * The app shell: the text written so far, the drawing pad, and the
 * candidates for what is drawn on it.
 */
export function App() {
  const database = useSignDatabase()
  const [strokes, setStrokes] = useState<readonly Stroke[]>([])
  const [sequence, editSequence] = useSequence()

  const candidates = useMemo(
    () =>
      database
        ? rank(strokes, database.drawable, { limit: CANDIDATE_COUNT }).map(
            (ranked) => ranked.sign,
          )
        : [],
    [database, strokes],
  )

  const pick = (sign: Sign) => {
    editSequence({ kind: "insert", item: sign.char })
    setStrokes([])
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Wedges</h1>
      <SequencePanel
        sequence={sequence}
        onAction={editSequence}
        nameOf={(char) => database?.sign(char)?.name}
      />
      <DrawingPanel strokes={strokes} onStrokesChange={setStrokes} />
      <CandidateList
        candidates={candidates}
        isLoading={!database}
        onPick={pick}
      />
      <p className={styles.footer}>
        Wedges is being built. Follow along on{" "}
        <Link href={REPO_URL}>GitHub</Link>.
      </p>
    </main>
  )
}
