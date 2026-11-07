import type { ReactNode } from "react"
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
} from "react-aria-components"

import styles from "./ListBox.module.css"

/** One choice in a {@link ListBox}. */
export interface ListBoxOption {
  /** Unique within the list. */
  id: string
  /** The option's accessible name, read out in place of its content. */
  label: string
  content: ReactNode
}

/** Props for {@link ListBox}. */
export interface ListBoxProps {
  /** The list's accessible name. */
  label: string
  options: readonly ListBoxOption[]
  /** The selected option's id, or null when none is selected. */
  selectedId: string | null
  /** Called with an option's id when it is tapped, or chosen with the arrow keys. */
  onSelect: (id: string) => void
  /**
   * False to leave taps to the list's parent, as when where an option is
   * tapped matters. The keyboard still selects: the arrow keys move between
   * options and Enter selects one. Selection then doesn't follow focus, so
   * the list taking focus from a tap selects nothing. Defaults to true.
   */
  selectsOnTap?: boolean
}

/**
 * A row of options, wrapping onto further lines as needed, of which one or
 * none is selected. Selection follows the arrow keys, unless taps are left
 * to the parent.
 */
export function ListBox({
  label,
  options,
  selectedId,
  onSelect,
  selectsOnTap = true,
}: ListBoxProps) {
  return (
    <AriaListBox
      className={styles.list}
      aria-label={label}
      orientation="horizontal"
      selectionMode="single"
      selectionBehavior={selectsOnTap ? "replace" : "toggle"}
      disallowEmptySelection
      selectedKeys={selectedId === null ? [] : [selectedId]}
      onSelectionChange={(keys) => {
        if (keys === "all") return
        const [id] = keys
        if (id !== undefined) onSelect(String(id))
      }}
      items={options}
    >
      {(option) => (
        <AriaListBoxItem
          className={
            selectsOnTap
              ? styles.option
              : `${styles.option} ${styles.untappable}`
          }
          id={option.id}
          textValue={option.label}
          aria-label={option.label}
        >
          {option.content}
        </AriaListBoxItem>
      )}
    </AriaListBox>
  )
}
