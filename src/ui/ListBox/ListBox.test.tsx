import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ListBox, type ListBoxOption } from "./ListBox"

const options: ListBoxOption[] = [
  { id: "a", label: "Alpha", content: "α" },
  { id: "b", label: "Beta", content: "β" },
  { id: "c", label: "Gamma", content: "γ" },
]

describe("ListBox", () => {
  it("names each option by its label, and marks the selected one", () => {
    render(
      <ListBox
        label="Letters"
        options={options}
        selectedId="b"
        onSelect={() => {}}
      />,
    )
    expect(screen.getByRole("listbox", { name: "Letters" })).toBeVisible()
    expect(screen.getByRole("option", { name: "Beta" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    expect(screen.getByRole("option", { name: "Alpha" })).toHaveAttribute(
      "aria-selected",
      "false",
    )
  })

  it("reports the option that is tapped", async () => {
    const onSelect = vi.fn()
    render(
      <ListBox
        label="Letters"
        options={options}
        selectedId="c"
        onSelect={onSelect}
      />,
    )
    await userEvent.click(screen.getByRole("option", { name: "Alpha" }))
    expect(onSelect).toHaveBeenCalledWith("a")
  })

  it("selects the next option with the right arrow key", async () => {
    const onSelect = vi.fn()
    render(
      <ListBox
        label="Letters"
        options={options}
        selectedId="a"
        onSelect={onSelect}
      />,
    )
    await userEvent.click(screen.getByRole("option", { name: "Alpha" }))
    await userEvent.keyboard("{ArrowRight}")
    expect(onSelect).toHaveBeenLastCalledWith("b")
  })

  it("stays selected when the selected option is tapped again", async () => {
    const onSelect = vi.fn()
    render(
      <ListBox
        label="Letters"
        options={options}
        selectedId="a"
        onSelect={onSelect}
      />,
    )
    await userEvent.click(screen.getByRole("option", { name: "Alpha" }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it("selects nothing on taking focus when it leaves taps to its parent", () => {
    const onSelect = vi.fn()
    render(
      <ListBox
        label="Letters"
        options={options}
        selectedId={null}
        onSelect={onSelect}
        selectsOnTap={false}
      />,
    )
    act(() => screen.getByRole("listbox").focus())
    expect(onSelect).not.toHaveBeenCalled()
  })
})
