import {
  showsCursor,
  type SequenceAction,
  type SequenceState,
} from "@/core/sequence"
import { Button } from "@/ui/Button/Button"
import { ListBox, type ListBoxOption } from "@/ui/ListBox/ListBox"

import { nearestBoundary } from "./nearestBoundary"
import styles from "./SequencePanel.module.css"

/** Props for {@link SequencePanel}. */
export interface SequencePanelProps {
  sequence: SequenceState
  onAction: (action: SequenceAction) => void
  /** The sign's name for a character, or undefined until the sign data has loaded. */
  nameOf: (char: string) => string | undefined
}

/**
 * The text being written, with a cursor after the selected sign, and buttons
 * to delete the sign before the cursor, or clear it all.
 * Tapping the text moves the cursor to the gap between signs nearest the tap;
 * with the keyboard, the arrow keys and Enter put it after a sign. The cursor
 * takes no width, so the signs stay put as it moves. Copying a selection of
 * signs within the text copies them as one run of text.
 */
export function SequencePanel({
  sequence,
  onAction,
  nameOf,
}: SequencePanelProps) {
  const { items, cursor } = sequence
  const caretAt = showsCursor(sequence) ? cursor : undefined

  const options: ListBoxOption[] = items.map((item, i) => ({
    id: String(i),
    label: nameOf(item) ?? item,
    content: (
      <span className={styles.item}>
        <span className={styles.sign}>{item}</span>
        {caretAt === 0 && i === 0 && <Caret className={styles.caretStart} />}
        {caretAt === i + 1 && <Caret className={styles.caretAfter} />}
      </span>
    ),
  }))

  return (
    <section className={styles.panel} aria-label="Text">
      <div
        className={styles.line}
        onClick={(event) => {
          const signs = event.currentTarget.querySelectorAll('[role="option"]')
          const boxes = [...signs].map((sign) => sign.getBoundingClientRect())
          const point = { x: event.clientX, y: event.clientY }
          onAction({ kind: "moveCursor", to: nearestBoundary(boxes, point) })
        }}
        onCopy={(event) => {
          // Each sign is laid out as its own box, so a selection would copy
          // with a line break between signs. A selection that reaches beyond
          // the text is copied as the browser would.
          const selection = document.getSelection()
          if (!selection || !isWithin(selection, event.currentTarget)) return
          const signs = selection.toString().replace(/\s/g, "")
          event.clipboardData.setData("text/plain", signs)
          event.preventDefault()
        }}
      >
        {caretAt === 0 && items.length === 0 && (
          <Caret className={styles.caretEmpty} />
        )}
        <ListBox
          label="Signs"
          options={options}
          selectedId={cursor === 0 ? null : String(cursor - 1)}
          onSelect={(id) =>
            onAction({ kind: "moveCursor", to: Number(id) + 1 })
          }
          selectsOnTap={false}
        />
      </div>
      <div className={styles.actions}>
        <Button
          onPress={() => onAction({ kind: "deleteBackward" })}
          isDisabled={cursor === 0}
        >
          Backspace
        </Button>
        <Button
          onPress={() => onAction({ kind: "clear" })}
          isDisabled={items.length === 0}
        >
          Clear text
        </Button>
      </div>
    </section>
  )
}

/** True if the selection has a range, and every range is inside `element`. */
function isWithin(selection: Selection, element: Element): boolean {
  for (let i = 0; i < selection.rangeCount; i++) {
    if (!element.contains(selection.getRangeAt(i).commonAncestorContainer)) {
      return false
    }
  }
  return selection.rangeCount > 0
}

function Caret({ className }: { className: string | undefined }) {
  return <span className={`${styles.caret} ${className}`} aria-hidden="true" />
}
