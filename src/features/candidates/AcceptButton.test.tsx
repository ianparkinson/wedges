import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { Sign } from "@/core/signs"

import { AcceptButton } from "./AcceptButton"

const AN: Sign = {
  char: "𒀭",
  name: "AN",
  oslId: "o0000099",
  values: [],
  samples: [],
}

describe("AcceptButton", () => {
  it("picks the best candidate, and shows its glyph", async () => {
    const onPick = vi.fn()
    render(<AcceptButton best={AN} onPick={onPick} />)
    const button = screen.getByRole("button", { name: "Accept" })
    expect(button).toHaveTextContent("Accept𒀭")

    await userEvent.click(button)
    expect(onPick).toHaveBeenCalledExactlyOnceWith(AN)
  })

  it("is disabled when there is no candidate", () => {
    render(<AcceptButton best={undefined} onPick={() => {}} />)
    expect(screen.getByRole("button", { name: "Accept" })).toBeDisabled()
  })
})
