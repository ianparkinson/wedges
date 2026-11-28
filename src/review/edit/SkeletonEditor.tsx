import type { Font } from "opentype.js"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { parseShape } from "@/core/skeleton"
import type { StrokeStyle } from "@/review/redraw/impression"
import type { RedrawLimits } from "@/review/redraw/limits"
import { RedrawView } from "@/review/RedrawView"
import { Button } from "@/ui/Button/Button"

import type { EditTool } from "./EditablePicture"
import { formatShape, moveShape } from "./shapeEdits"
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
  /** A class for the picture, as for {@link RedrawView}. */
  pictureClassName?: string
}

/** How far a duplicate lies from the shape it copies, right and down. */
const DUPLICATE_OFFSET = 4

/** The drawing tools, with the keys that choose them. */
const TOOLS: readonly { tool: EditTool; label: string; key: string }[] = [
  { tool: "select", label: "Select (V)", key: "v" },
  { tool: "wedge", label: "Wedge (W)", key: "w" },
  { tool: "winkelhaken", label: "Winkelhaken (K)", key: "k" },
]

/**
 * A sign's shapes to edit, both over the glyph, where they can be dragged
 * and new ones drawn, and as text, scored as they change, with undo and
 * redo. The picture takes the focus to start with. With it focused, V, W
 * and K choose a tool, D duplicates the selected shape, and Delete or
 * Backspace deletes it. Ctrl+Enter or Cmd+Enter saves, wherever the focus is.
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
  pictureClassName,
}: SkeletonEditorProps) {
  const draft = useShapesDraft(initial ?? [])
  const [selected, setSelected] = useState<number>()
  const [tool, setTool] = useState<EditTool>("select")
  const [saving, setSaving] = useState<{ error?: string; isSaving: boolean }>({
    isSaving: false,
  })
  const canDrag = draft.problems.length === 0
  const canSave =
    draft.problems.length === 0 && draft.text.trim() !== "" && !saving.isSaving
  const view = useRef<HTMLDivElement>(null)

  const save = () => {
    setSaving({ isSaving: true })
    onSave(draft.shapes).then(onDone, (error: unknown) =>
      setSaving({ isSaving: false, error: String(error) }),
    )
  }

  // Focus the picture, so its keys work at once, without scrolling to it.
  useEffect(() => {
    view.current
      ?.querySelector<SVGElement>("[tabindex]")
      ?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) return
      event.preventDefault()
      if (canSave) save()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const remove = () => {
    if (selected === undefined) return
    draft.setShapes(draft.shapes.toSpliced(selected, 1))
    setSelected(undefined)
  }

  const duplicate = () => {
    const shape = selected === undefined ? undefined : draft.shapes[selected]
    if (!shape) return
    const copy = moveShape(
      parseShape(shape),
      DUPLICATE_OFFSET,
      -DUPLICATE_OFFSET,
    )
    draft.setShapes([...draft.shapes, formatShape(copy)])
    setSelected(draft.shapes.length)
  }

  // Keys the picture leaves alone, as they bubble up from it.
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const key = event.key.toLowerCase()
    const chosen = TOOLS.find((t) => t.key === key)
    if (chosen) {
      setTool(chosen.tool)
    } else if (key === "d") {
      duplicate()
    } else if (key === "delete" || key === "backspace") {
      remove()
    } else if (key === "escape" && tool !== "select") {
      setTool("select")
    } else {
      return
    }
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <>
      {canDrag && (
        <div className={styles.tools}>
          {TOOLS.map(({ tool: t, label }) => (
            <Button key={t} onPress={() => setTool(t)} isProminent={t === tool}>
              {label}
            </Button>
          ))}
          <Button onPress={duplicate} isDisabled={selected === undefined}>
            Duplicate (D)
          </Button>
          <Button onPress={remove} isDisabled={selected === undefined}>
            Delete (Del)
          </Button>
        </div>
      )}
      {/* The keys come from the picture inside, which is focusable. */}
      <div
        ref={view}
        className={styles.view}
        onKeyDown={canDrag ? onKeyDown : undefined}
      >
        <RedrawView
          text={text}
          shapes={draft.shapes}
          font={font}
          winkelhakenAngle={winkelhakenAngle}
          style={style}
          limits={limits}
          others={others}
          unmatched="new"
          showGlyph={showGlyph}
          showSkeleton={showSkeleton}
          pictureClassName={pictureClassName}
          edit={
            canDrag
              ? {
                  tool,
                  selected,
                  onSelect: setSelected,
                  onEdit: draft.setShapes,
                  onUndo: draft.undo,
                  onRedo: draft.redo,
                  onDrawn: () => setTool("select"),
                }
              : undefined
          }
        />
      </div>
      <p className={styles.hint}>
        {canDrag
          ? tool === "select"
            ? "Drag a shape or its handles, holding Alt to turn it freely. With a shape selected, the arrow keys move it, [ and ] turn it, and - and = change its length."
            : tool === "wedge"
              ? "Drag from a wedge's head to the end of its tail. Then the new shape is selected, to adjust."
              : "Drag from a Winkelhaken's vertex along its upper leg, or its lower leg with Shift, or click for a small one opening right. Then the new shape is selected, to adjust."
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
        canSave={canSave}
        error={saving.error}
        isSaving={saving.isSaving}
        onSave={save}
        onCancel={onDone}
      />
    </>
  )
}
