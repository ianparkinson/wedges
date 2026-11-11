import { type KeyboardEvent, type ReactNode, type Ref } from "react"
import {
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
} from "react-aria-components"

import { IconButton } from "@/ui/IconButton/IconButton"
import { InfoIcon } from "@/ui/InfoIcon/InfoIcon"

import styles from "./ActionList.module.css"

/** One item in an {@link ActionList}. */
export interface ActionListItem {
  /** Unique within the list. */
  id: string
  /** The item's accessible name, read out in place of its content. */
  label: string
  content: ReactNode
  /** The ⓘ's accessible name, such as "About AN". */
  infoLabel: string
  /** Draws the item with the accent colour, for the main choice among several. */
  isProminent?: boolean
}

/** Props for {@link ActionList}. */
export interface ActionListProps {
  /** The list's accessible name. */
  label: string
  items: readonly ActionListItem[]
  /** Called with an item's id when it is tapped, or chosen with Enter. */
  onAction: (id: string) => void
  /** Called with an item's id when its ⓘ is pressed. */
  onInfo: (id: string) => void
  /**
   * A column of full-width rows, each with its ⓘ centred at its end, or a
   * row of items sharing the width, each with its ⓘ in its top right
   * corner. Defaults to a column.
   */
  orientation?: "vertical" | "horizontal"
  /**
   * Called when the up arrow key is pressed on the first item of a column,
   * such as to move back to a search field above the list.
   */
  onArrowUpFromFirst?: () => void
  /** The list's element, for focusing it from elsewhere. */
  ref?: Ref<HTMLDivElement>
}

/**
 * Items drawn as buttons, each with an ⓘ that does something else, such as
 * opening more about what the item picks. The list is one stop for Tab: the
 * arrow keys move between items, and across from an item to its ⓘ.
 */
export function ActionList({
  label,
  items,
  onAction,
  onInfo,
  orientation = "vertical",
  onArrowUpFromFirst,
  ref,
}: ActionListProps) {
  // React Aria's grid does nothing with the up arrow key on its first item,
  // so the key is caught on its way down to the grid.
  const onKeyDownCapture = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement
    if (
      event.key === "ArrowUp" &&
      onArrowUpFromFirst &&
      target.getAttribute("role") === "row" &&
      target.dataset["key"] === items[0]?.id
    ) {
      event.preventDefault()
      event.stopPropagation()
      onArrowUpFromFirst()
    }
  }

  return (
    <div className={styles.wrapper} onKeyDownCapture={onKeyDownCapture}>
      <AriaGridList
        ref={ref}
        className={`${styles.list} ${styles[orientation]}`}
        aria-label={label}
        layout={orientation === "horizontal" ? "grid" : "stack"}
        items={items}
        onAction={(id) => onAction(String(id))}
      >
        {(item) => (
          <AriaGridListItem
            className={
              item.isProminent
                ? `${styles.item} ${styles.prominent}`
                : styles.item
            }
            id={item.id}
            textValue={item.label}
          >
            <span className={styles.content}>{item.content}</span>
            <span className={styles.info}>
              <IconButton
                label={item.infoLabel}
                onPress={() => onInfo(item.id)}
              >
                <InfoIcon />
              </IconButton>
            </span>
          </AriaGridListItem>
        )}
      </AriaGridList>
    </div>
  )
}
