import { useEffect, useImperativeHandle, useRef, type Ref } from "react"
import {
  Button as AriaButton,
  SearchField as AriaSearchField,
  Input,
  Label,
} from "react-aria-components"

import styles from "./SearchField.module.css"

/** Props for {@link SearchField}. */
export interface SearchFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  /**
   * Focuses the field once it has been drawn, which opens a phone's keyboard.
   */
  autoFocus?: boolean
  /** Called when the down arrow key is pressed, such as to move into results below. */
  onArrowDown?: () => void
  /** The text field, for focusing it from elsewhere. */
  ref?: Ref<HTMLInputElement>
}

/**
 * A labelled text field for a search query, with a button to clear it.
 * Escape clears it too.
 */
export function SearchField({
  label,
  value,
  onChange,
  autoFocus = false,
  onArrowDown,
  ref,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current!, [])

  // Focusing the field before it has been painted opens Android's keyboard
  // first, and Chrome keeps showing the old screen until the keyboard is fully
  // open. The field is rendered in the task that showed it, and the first
  // animation frame callback runs before that frame is painted, so it is still
  // too early. The second runs a frame later, once the field is on screen.
  useEffect(() => {
    if (!autoFocus) return
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => inputRef.current?.focus())
    })
    return () => cancelAnimationFrame(frame)
  }, [autoFocus])

  return (
    <AriaSearchField
      className={styles.field}
      value={value}
      onChange={onChange}
      onKeyDown={(event) => {
        if (event.key !== "ArrowDown" || !onArrowDown) {
          event.continuePropagation()
          return
        }
        event.preventDefault()
        onArrowDown()
      }}
    >
      <Label className={styles.label}>{label}</Label>
      <div className={styles.box}>
        <Input
          ref={inputRef}
          className={styles.input}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        {value && (
          <AriaButton className={styles.clear} aria-label="Clear search">
            ×
          </AriaButton>
        )}
      </div>
    </AriaSearchField>
  )
}
