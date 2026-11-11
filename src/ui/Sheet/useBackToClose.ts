import { useEffect, useRef } from "react"

/** Marks the history entry that stands for an open sheet. */
const SHEET_STATE = { wedgesSheet: true }

/** Closes the open sheet, or is undefined while none is open. */
let closeOpenSheet: (() => void) | undefined

/** Whether the current history entry is the open sheet's. */
let isOnSheetEntry = false

/** Whether we called `history.back()` and its `popstate` hasn't fired yet. */
let isGoingBack = false

let isListening = false

/**
 * Lets the browser's back button or gesture close a sheet while it is open,
 * by calling `onBack`, instead of leaving the app. An open sheet has one
 * history entry, with the app's own URL, which back pops. When the sheet
 * closes some other way, the entry is popped for it, so that the next back
 * still does what it should.
 */
export function useBackToClose(isOpen: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack)
  useEffect(() => {
    onBackRef.current = onBack
  })

  useEffect(() => {
    if (!isOpen) return

    if (!isListening) {
      // After a reload, the app may start on the entry of a sheet that was open.
      isOnSheetEntry = isSheetState(history.state)
      window.addEventListener("popstate", onPopState)
      isListening = true
    }
    closeOpenSheet = () => onBackRef.current()
    scheduleSync()

    return () => {
      closeOpenSheet = undefined
      scheduleSync()
    }
  }, [isOpen])
}

function onPopState() {
  isOnSheetEntry = isSheetState(history.state)

  if (isGoingBack) {
    isGoingBack = false
  } else if (!isOnSheetEntry && closeOpenSheet) {
    // The person went back from the sheet's entry.
    const close = closeOpenSheet
    closeOpenSheet = undefined
    close()
  }

  scheduleSync()
}

/**
 * Adds or pops the sheet's entry once the current task is done, so that a
 * sheet closed and opened again at once, as React's StrictMode does on mount,
 * leaves the history as it was.
 */
function scheduleSync() {
  queueMicrotask(() => {
    if (isGoingBack) return

    if (closeOpenSheet && !isOnSheetEntry) {
      history.pushState(SHEET_STATE, "")
      isOnSheetEntry = true
    } else if (!closeOpenSheet && isOnSheetEntry) {
      isGoingBack = true
      history.back()
    }
  })
}

function isSheetState(state: unknown): boolean {
  return typeof state === "object" && state !== null && "wedgesSheet" in state
}
