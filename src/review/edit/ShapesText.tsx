import { Button } from "@/ui/Button/Button"

import styles from "./ShapesText.module.css"

/** Props for {@link ShapesText}. */
export interface ShapesTextProps {
  /** The shapes as typed, one to a line. */
  value: string
  onChange: (value: string) => void
  /** Messages about lines that aren't shapes, which stop the save. */
  problems: readonly string[]
  /** Whether the shapes can be saved as they are. */
  canSave: boolean
  /** Why the last save failed, if it did. */
  error?: string
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
}

/**
 * A sign's shapes as text to edit, one to a line, with Save and Cancel.
 * Esc in the text cancels.
 */
export function ShapesText({
  value,
  onChange,
  problems,
  canSave,
  error,
  isSaving,
  onSave,
  onCancel,
}: ShapesTextProps) {
  return (
    <div className={styles.editor}>
      <label className={styles.label}>
        Shapes, one to a line
        <textarea
          className={styles.text}
          value={value}
          rows={Math.max(4, value.split("\n").length + 1)}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel()
          }}
        />
      </label>
      {problems.length > 0 && (
        <ul className={styles.problems} aria-label="Not shapes">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
      {error && (
        <p className={styles.problems} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button onPress={onSave} isDisabled={!canSave}>
          {isSaving ? "Saving…" : "Save (Ctrl+Enter)"}
        </Button>
        <Button onPress={onCancel}>Cancel (Esc)</Button>
      </div>
    </div>
  )
}
