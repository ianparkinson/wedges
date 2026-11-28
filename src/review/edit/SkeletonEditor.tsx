import type { Font } from "opentype.js"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { parseShape } from "@/core/skeleton"
import { compareShapes } from "@/core/skeletonOrder"
import { isPageKey } from "@/review/pageKeys"
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
  /** Marks the shapes reviewed, after R has saved them and ended the edit. */
  onReviewed: (shapes: readonly string[]) => void
  /** A class for the picture, as for {@link RedrawView}. */
  pictureClassName?: string
}

/** How far a duplicate lies from the shape it copies, right and down. */
const DUPLICATE_OFFSET = 4

/**
 * Shapes as a save writes them into the file, so that a reviewed mark made
 * for them matches the file: spaced singly, and in the file's order.
 */
function asSaved(shapes: readonly string[]): readonly string[] {
  return shapes
    .map((shape) => shape.trim().split(/\s+/).join(" "))
    .toSorted(compareShapes)
}

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
 * Backspace deletes it. Ctrl+Enter or Cmd+Enter saves, wherever the focus is,
 * and R saves and then marks the shapes reviewed.
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
  onReviewed,
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

  const save = (then?: (shapes: readonly string[]) => void) => {
    const shapes = draft.shapes
    setSaving({ isSaving: true })
    onSave(shapes).then(
      () => {
        onDone()
        then?.(asSaved(shapes))
      },
      (error: unknown) => setSaving({ isSaving: false, error: String(error) }),
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

  // R saves before it marks the sign reviewed and moves on, or does nothing
  // while the shapes can't be saved. Caught on the way down, so the page's
  // own R, which would move on without saving, never sees it.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() !== "r" || !isPageKey(event)) return
      event.preventDefault()
      event.stopPropagation()
      if (canSave) save(onReviewed)
    }
    window.addEventListener("keydown", onKey, { capture: true })
    return () => window.removeEventListener("keydown", onKey, { capture: true })
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
        onSave={() => save()}
        onCancel={onDone}
      />
    </>
  )
}
