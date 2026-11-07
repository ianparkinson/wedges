import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { type SequenceState } from "@/core/sequence"

import { tapText } from "../../../test/tapText"
import { SequencePanel } from "./SequencePanel"

const AN = "𒀭"
const KA = "𒅗"

const NAMES: Record<string, string> = { [AN]: "AN", [KA]: "KA" }

function renderPanel(sequence: SequenceState) {
  const onAction = vi.fn()
  render(
    <SequencePanel
      sequence={sequence}
      onAction={onAction}
      nameOf={(char) => NAMES[char]}
    />,
  )
  return onAction
}

describe("SequencePanel", () => {
  it("lists each sign by name", () => {
    renderPanel({ items: [AN, KA, AN], cursor: 3, cursorPlaced: false })
    expect(
      screen.getAllByRole("option").map((option) => option.ariaLabel),
    ).toEqual(["AN", "KA", "AN"])
  })

  it("names a sign by its character until the sign data has loaded", () => {
    render(
      <SequencePanel
        sequence={{ items: [AN], cursor: 1, cursorPlaced: false }}
        onAction={() => {}}
        nameOf={() => undefined}
      />,
    )
    expect(screen.getByRole("option", { name: AN })).toBeVisible()
  })

  it("selects the sign before the cursor", () => {
    renderPanel({ items: [AN, KA], cursor: 1, cursorPlaced: false })
    expect(screen.getByRole("option", { name: "AN" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
  })

  it("moves the cursor to the gap between signs nearest a tap", () => {
    const onAction = renderPanel({
      items: [AN, KA],
      cursor: 2,
      cursorPlaced: false,
    })

    // Each sign is 40 pixels wide: AN from 0 to 40, KA from 40 to 80.
    tapText(10)
    tapText(30)
    tapText(300)
    expect(onAction.mock.calls).toEqual([
      [{ kind: "moveCursor", to: 0 }],
      [{ kind: "moveCursor", to: 1 }],
      [{ kind: "moveCursor", to: 2 }],
    ])
  })

  it("moves the cursor after the sign chosen with the arrow keys and Enter", async () => {
    const onAction = renderPanel({
      items: [AN, KA],
      cursor: 1,
      cursorPlaced: false,
    })
    await userEvent.tab()
    await userEvent.keyboard("{ArrowRight}")
    expect(onAction).not.toHaveBeenCalled()
    await userEvent.keyboard("{Enter}")
    expect(onAction).toHaveBeenLastCalledWith({ kind: "moveCursor", to: 2 })
  })

  it("deletes backward and clears", async () => {
    const onAction = renderPanel({
      items: [AN],
      cursor: 1,
      cursorPlaced: false,
    })
    await userEvent.click(screen.getByRole("button", { name: "Backspace" }))
    await userEvent.click(screen.getByRole("button", { name: "Clear text" }))
    expect(onAction.mock.calls).toEqual([
      [{ kind: "deleteBackward" }],
      [{ kind: "clear" }],
    ])
  })

  it("disables Backspace at the start, and Clear text when empty", () => {
    renderPanel({ items: [], cursor: 0, cursorPlaced: false })
    expect(screen.getByRole("button", { name: "Backspace" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Clear text" })).toBeDisabled()
  })
})
