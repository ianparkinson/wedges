import { useImperativeHandle, useLayoutEffect, useRef, type Ref } from "react"
import {
  Button as AriaButton,
  SearchField as AriaSearchField,
  Input,
  Label,
} from "react-aria-components"

import styles from "./SearchField.module.css"

/** Animation frames to wait before autofocusing on Android. */
const FOCUS_DELAY_FRAMES = 3

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

  // On Android, focusing the field before it is on screen opens the keyboard
  // first, and Chrome keeps showing the old screen until the keyboard is fully
  // open. This effect runs before the browser paints the field, so there wait
  // a few animation frames: on a phone, two proved too few.
  //
  // Elsewhere the field is focused straight away. iOS needs that, as it only
  // opens the keyboard for focus given while handling a tap.
  useLayoutEffect(() => {
    if (!autoFocus) return

    if (isAndroid()) {
      let frame = 0
      const focusAfter = (frames: number) => {
        frame = requestAnimationFrame(() => {
          if (frames > 1) {
            focusAfter(frames - 1)
          } else {
            inputRef.current?.focus()
          }
        })
      }
      focusAfter(FOCUS_DELAY_FRAMES)
      return () => cancelAnimationFrame(frame)
    } else {
      inputRef.current?.focus()
    }
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

/** Whether this is an Android phone or tablet. */
function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent)
}
