import { useState } from "react"

import { Button } from "@/ui/Button/Button"

import styles from "./MarkShown.module.css"
import type { MarkedSign } from "./useReviewed"

/** Props for {@link MarkShown}. */
export interface MarkShownProps {
  /** The traced signs the filters show, whether drawn yet or not. */
  signs: readonly MarkedSign[]
  onMark: (signs: readonly MarkedSign[], reviewed: boolean) => void
}

/**
 * Buttons that mark every sign shown reviewed, or unreviewed. Each asks to be
 * confirmed with a second press, so that one stray click can't undo a day's
 * marks.
 */
export function MarkShown({ signs, onMark }: MarkShownProps) {
  const [asking, setAsking] = useState<boolean>()

  if (asking === undefined) {
    return (
      <div className={styles.buttons}>
        <Button isDisabled={signs.length === 0} onPress={() => setAsking(true)}>
          Mark shown reviewed
        </Button>
        <Button
          isDisabled={signs.length === 0}
          onPress={() => setAsking(false)}
        >
          Mark shown unreviewed
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.buttons}>
      <Button
        isProminent
        onPress={() => {
          onMark(signs, asking)
          setAsking(undefined)
        }}
      >
        Mark {signs.length} {signs.length === 1 ? "sign" : "signs"}{" "}
        {asking ? "reviewed" : "unreviewed"}
      </Button>
      <Button onPress={() => setAsking(undefined)}>Cancel</Button>
    </div>
  )
}
