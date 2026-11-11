import type { ReactNode } from "react"

import type { Stroke } from "@/core/strokes"
import { Button } from "@/ui/Button/Button"
import { ButtonBar } from "@/ui/ButtonBar/ButtonBar"

import { DrawingPad } from "./DrawingPad"
import styles from "./DrawingPanel.module.css"

/** Props for {@link DrawingPanel}. */
export interface DrawingPanelProps {
  strokes: readonly Stroke[]
  onStrokesChange: (strokes: readonly Stroke[]) => void
  /** The main button, at the right-hand end of the row under the pad. */
  children?: ReactNode
}

/**
 * The drawing pad, with buttons to undo the last stroke or clear them all,
 * and the button given at the right-hand end of their row. The pad fills the
 * panel's width, and is as tall as the space allows, between its minimum and
 * maximum sizes.
 */
export function DrawingPanel({
  strokes,
  onStrokesChange,
  children,
}: DrawingPanelProps) {
  const empty = strokes.length === 0
  return (
    <section className={styles.panel} aria-label="Draw a sign">
      <div className={styles.padArea}>
        <DrawingPad
          strokes={strokes}
          onStroke={(stroke) => onStrokesChange([...strokes, stroke])}
        />
      </div>
      <ButtonBar end={children}>
        <Button
          onPress={() => onStrokesChange(strokes.slice(0, -1))}
          isDisabled={empty}
        >
          Undo
        </Button>
        <Button onPress={() => onStrokesChange([])} isDisabled={empty}>
          Clear
        </Button>
      </ButtonBar>
    </section>
  )
}
