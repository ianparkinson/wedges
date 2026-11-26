import { useState } from "react"

import { draftShapes, type DraftShapes } from "./draftShapes"

/** A sign's shapes being edited, as text, with its undo history. */
export interface ShapesDraft extends DraftShapes {
  /** The shapes as typed, one to a line. */
  readonly text: string
  /** Replaces the text, as one step to undo. */
  setText: (text: string) => void
  /**
   * Replaces the shapes. With `continuing`, as part of the step before, such
   * as each move of a drag after the first.
   */
  setShapes: (shapes: readonly string[], continuing?: boolean) => void
  undo: () => void
  redo: () => void
  readonly canUndo: boolean
  readonly canRedo: boolean
}

interface History {
  readonly past: readonly string[]
  readonly text: string
  readonly future: readonly string[]
}

/** Shapes to edit, starting from `initial`, with undo and redo. */
export function useShapesDraft(initial: readonly string[]): ShapesDraft {
  const [history, setHistory] = useState<History>({
    past: [],
    text: initial.join("\n"),
    future: [],
  })

  const replace = (text: string, continuing = false) =>
    setHistory((h) =>
      text === h.text
        ? h
        : {
            past: continuing ? h.past : [...h.past, h.text],
            text,
            future: [],
          },
    )

  return {
    ...draftShapes(history.text),
    text: history.text,
    setText: (text) => replace(text),
    setShapes: (shapes, continuing) => replace(shapes.join("\n"), continuing),
    undo: () =>
      setHistory((h) =>
        h.past.length === 0
          ? h
          : {
              past: h.past.slice(0, -1),
              text: h.past.at(-1)!,
              future: [h.text, ...h.future],
            },
      ),
    redo: () =>
      setHistory((h) =>
        h.future.length === 0
          ? h
          : {
              past: [...h.past, h.text],
              text: h.future[0]!,
              future: h.future.slice(1),
            },
      ),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
