import { useState } from "react"
import { useCopyToClipboard, useTimeout } from "usehooks-ts"

import { Button } from "@/ui/Button/Button"
import { ScreenReaderStatus } from "@/ui/ScreenReaderStatus/ScreenReaderStatus"

/** How long the button says whether it copied, in milliseconds. */
const CONFIRMATION_MS = 2000

type Outcome = "none" | "copied" | "failed"

/** Props for {@link CopyButton}. */
export interface CopyButtonProps {
  text: string
}

/**
 * Copies the text to the clipboard. For a moment afterwards the button says
 * whether it worked, and a status says the same to screen readers. Browsers
 * offer the clipboard only to pages served over HTTPS or from localhost, so
 * elsewhere the button is disabled.
 */
export function CopyButton({ text }: CopyButtonProps) {
  const [, copy] = useCopyToClipboard()
  const [outcome, setOutcome] = useState<Outcome>("none")
  useTimeout(
    () => setOutcome("none"),
    outcome === "none" ? null : CONFIRMATION_MS,
  )

  const isSupported = navigator.clipboard !== undefined
  const press = async () => setOutcome((await copy(text)) ? "copied" : "failed")

  return (
    <>
      <Button
        onPress={() => void press()}
        isDisabled={!isSupported || text === ""}
        isProminent
      >
        {label(outcome)}
      </Button>
      <ScreenReaderStatus message={outcome === "none" ? "" : label(outcome)} />
    </>
  )
}

function label(outcome: Outcome): string {
  switch (outcome) {
    case "none":
      return "Copy"
    case "copied":
      return "Copied"
    case "failed":
      return "Not copied"
  }
}
