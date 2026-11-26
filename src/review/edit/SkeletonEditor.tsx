import type { Font } from "opentype.js"
import { useState } from "react"

import type { StrokeStyle } from "@/review/redraw/impression"
import type { RedrawLimits } from "@/review/redraw/limits"
import { RedrawView } from "@/review/RedrawView"
import { Button } from "@/ui/Button/Button"

import { ShapesText } from "./ShapesText"
import styles from "./SkeletonEditor.module.css"
import { useShapesDraft } from "./useShapesDraft"

/** Props for {@link SkeletonEditor}. */
export interface SkeletonEditorProps {
  text: string
  /** The shapes to start from, or undefined to start from none. */
  shapes: readonly string[] | undefined
  font: Font
  winkelhakenAngle: number
  style: StrokeStyle
  limits?: RedrawLimits
  /** Shapes to compare with, as for {@link RedrawView}. */
  others?: readonly string[]
  showGlyph: boolean
  showSkeleton: boolean
  /** Saves the shapes. Rejects, saying why, if it can't. */
  onSave: (shapes: readonly string[]) => Promise<void>
  /** Ends the edit, after a save or on cancelling. */
  onDone: () => void
}

/**
 * A sign's shapes to edit, both by dragging them over the glyph and as text,
 * scored as they change, with undo and redo.
 */
export function SkeletonEditor({
  text,
  shapes: initial,
  font,
  winkelhakenAngle,
  style,
  limits,
  others,
  showGlyph,
  showSkeleton,
  onSave,
  onDone,
}: SkeletonEditorProps) {
  const draft = useShapesDraft(initial ?? [])
  const [selected, setSelected] = useState<number>()
  const [saving, setSaving] = useState<{ error?: string; isSaving: boolean }>({
    isSaving: false,
  })
  const canDrag = draft.problems.length === 0

  const save = () => {
    setSaving({ isSaving: true })
    onSave(draft.shapes).then(onDone, (error: unknown) =>
      setSaving({ isSaving: false, error: String(error) }),
    )
  }

  return (
    <>
      <RedrawView
        text={text}
        shapes={draft.shapes.length > 0 ? draft.shapes : undefined}
        font={font}
        winkelhakenAngle={winkelhakenAngle}
        style={style}
        limits={limits}
        others={others}
        unmatched="new"
        showGlyph={showGlyph}
        showSkeleton={showSkeleton}
        edit={
          canDrag
            ? {
                selected,
                onSelect: setSelected,
                onEdit: draft.setShapes,
                onUndo: draft.undo,
                onRedo: draft.redo,
              }
            : undefined
        }
      />
      <p className={styles.hint}>
        {canDrag
          ? "Drag a shape or its handles, holding Alt to turn it freely. With a shape selected, the arrow keys move it, [ and ] turn it, and - and = change its length."
          : "Correct the lines that aren't shapes to drag the shapes."}
      </p>
      <div className={styles.history}>
        <Button onPress={draft.undo} isDisabled={!draft.canUndo}>
          Undo (Ctrl+Z)
        </Button>
        <Button onPress={draft.redo} isDisabled={!draft.canRedo}>
          Redo
        </Button>
      </div>
      <ShapesText
        value={draft.text}
        onChange={draft.setText}
        problems={draft.problems}
        error={saving.error}
        isSaving={saving.isSaving}
        onSave={save}
        onCancel={onDone}
      />
    </>
  )
}
