import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ActionList, type ActionListItem } from "./ActionList"

const items: ActionListItem[] = [
  { id: "a", label: "Alpha", content: "α", infoLabel: "About Alpha" },
  { id: "b", label: "Beta", content: "β", infoLabel: "About Beta" },
  { id: "c", label: "Gamma", content: "γ", infoLabel: "About Gamma" },
]

function renderList(orientation: "vertical" | "horizontal" = "vertical") {
  const onAction = vi.fn()
  const onInfo = vi.fn()
  render(
    <>
      <button>Before</button>
      <ActionList
        label="Letters"
        items={items}
        onAction={onAction}
        onInfo={onInfo}
        orientation={orientation}
      />
      <button>After</button>
    </>,
  )
  return { onAction, onInfo }
}

describe("ActionList", () => {
  it("names each item by its label", () => {
    renderList()
    expect(screen.getByRole("grid", { name: "Letters" })).toBeVisible()
    expect(screen.getAllByRole("row").map((row) => row.ariaLabel)).toEqual([
      "Alpha",
      "Beta",
      "Gamma",
    ])
  })

  it("acts on the item tapped, not its ⓘ", async () => {
    const { onAction, onInfo } = renderList()
    await userEvent.click(screen.getByRole("row", { name: "Beta" }))
    expect(onAction).toHaveBeenCalledExactlyOnceWith("b")
    expect(onInfo).not.toHaveBeenCalled()
  })

  it("presses the ⓘ tapped, not its item", async () => {
    const { onAction, onInfo } = renderList()
    await userEvent.click(screen.getByRole("button", { name: "About Beta" }))
    expect(onInfo).toHaveBeenCalledExactlyOnceWith("b")
    expect(onAction).not.toHaveBeenCalled()
  })

  it("is one stop for Tab", async () => {
    renderList()
    await userEvent.click(screen.getByRole("button", { name: "Before" }))
    await userEvent.tab()
    expect(screen.getByRole("row", { name: "Alpha" })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus()
  })

  it("moves between items with the arrow keys, and acts on one with Enter", async () => {
    const { onAction } = renderList()
    await userEvent.click(screen.getByRole("button", { name: "Before" }))
    await userEvent.tab()
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}{Enter}")
    expect(onAction).toHaveBeenCalledExactlyOnceWith("b")
  })

  it("moves across to an item's ⓘ with the right arrow key", async () => {
    const { onAction, onInfo } = renderList()
    await userEvent.click(screen.getByRole("button", { name: "Before" }))
    await userEvent.tab()
    await userEvent.keyboard("{ArrowDown}{ArrowRight}")
    expect(screen.getByRole("button", { name: "About Beta" })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(onInfo).toHaveBeenCalledExactlyOnceWith("b")
    expect(onAction).not.toHaveBeenCalled()
  })

  it("in a row, moves between items with the left and right arrow keys, and Tab reaches the ⓘ", async () => {
    renderList("horizontal")
    await userEvent.click(screen.getByRole("button", { name: "Before" }))
    await userEvent.tab()
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowLeft}")
    expect(screen.getByRole("row", { name: "Beta" })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "About Beta" })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus()
  })
})
