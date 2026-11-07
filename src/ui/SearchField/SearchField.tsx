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
  /** Focuses the field when it appears, which opens a phone's keyboard. */
  autoFocus?: boolean
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
}: SearchFieldProps) {
  return (
    <AriaSearchField
      className={styles.field}
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
    >
      <Label className={styles.label}>{label}</Label>
      <div className={styles.box}>
        <Input
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
