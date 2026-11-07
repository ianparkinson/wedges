import { useState } from "react"

import type { Stroke } from "@/core/strokes"
import { DrawingPanel } from "@/features/drawing/DrawingPanel"
import { Link } from "@/ui/Link/Link"

import styles from "./App.module.css"

const REPO_URL = "https://github.com/ianparkinson/wedges"

/** The app shell: a header, the drawing pad, and a link to the source. */
export function App() {
  const [strokes, setStrokes] = useState<readonly Stroke[]>([])

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Wedges</h1>
      <DrawingPanel strokes={strokes} onStrokesChange={setStrokes} />
      <p className={styles.footer}>
        Wedges is being built. Follow along on{" "}
        <Link href={REPO_URL}>GitHub</Link>.
      </p>
    </main>
  )
}
