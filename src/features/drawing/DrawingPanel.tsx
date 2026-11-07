import type { ReactNode } from "react"

import type { Stroke } from "@/core/strokes"
import { Button } from "@/ui/Button/Button"

import { DrawingPad } from "./DrawingPad"
import styles from "./DrawingPanel.module.css"

/** Props for {@link DrawingPanel}. */
export interface DrawingPanelProps {
  strokes: readonly Stroke[]
  onStrokesChange: (strokes: readonly Stroke[]) => void
  /** More buttons, at the right-hand end of the row under the pad. */
  children?: ReactNode
}

/**
 * The drawing pad, with buttons to undo the last stroke or clear them all,
 * and any others given at the right-hand end of their row.
 */
export function DrawingPanel({
  strokes,
  onStrokesChange,
  children,
}: DrawingPanelProps) {
  const empty = strokes.length === 0
  return (
    <section className={styles.panel} aria-label="Draw a sign">
      <DrawingPad
        strokes={strokes}
        onStroke={(stroke) => onStrokesChange([...strokes, stroke])}
      />
      <div className={styles.actions}>
        <Button
          onPress={() => onStrokesChange(strokes.slice(0, -1))}
          isDisabled={empty}
        >
          Undo stroke
        </Button>
        <Button onPress={() => onStrokesChange([])} isDisabled={empty}>
          Clear
        </Button>
        <span className={styles.spacer} />
        {children}
      </div>
    </section>
  )
}
