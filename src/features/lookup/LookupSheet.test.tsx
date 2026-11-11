import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { PA, SI, smallDatabase, TE } from "@test/smallDatabase"

import { LookupSheet } from "./LookupSheet"

function renderSheet(onAppend = () => {}, onClose = () => {}) {
  render(
    <LookupSheet
      signDatabase={smallDatabase}
      isOpen
      onClose={onClose}
      onAppend={onAppend}
    />,
  )
}

function results() {
  return within(screen.getByRole("grid", { name: "Results" })).getAllByRole(
    "row",
  )
}

describe("LookupSheet", () => {
  it("asks for a query before anything is typed", () => {
    renderSheet()
    expect(screen.getByText(/Type a name or value/)).toBeVisible()
  })

  it("finds a sign by a value typed without special characters", async () => {
    renderSheet()
    await userEvent.type(screen.getByRole("searchbox"), "sza")
    expect(results()[0]).toHaveAccessibleName("ŠA")
  })

  it("finds a sequence by its reading", async () => {
    renderSheet()
    await userEvent.type(screen.getByRole("searchbox"), "ensi2")
    expect(results()[0]).toHaveAccessibleName("|PA.TE.SI| ensi₂")
  })

  it("moves from the search field into the results with the down arrow key", async () => {
    const onAppend = vi.fn()
    renderSheet(onAppend)
    await userEvent.type(screen.getByRole("searchbox"), "ensi2")
    await userEvent.keyboard("{ArrowDown}")
    expect(results()[0]).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(onAppend).toHaveBeenCalledExactlyOnceWith(PA + TE + SI)
  })

  it("moves back up from the first result to the search field", async () => {
    renderSheet()
    await userEvent.type(screen.getByRole("searchbox"), "an")
    await userEvent.keyboard("{ArrowDown}")
    expect(results()[0]).toHaveFocus()
    await userEvent.keyboard("{ArrowUp}")
    expect(screen.getByRole("searchbox")).toHaveFocus()
  })

  it("says so when nothing is found", async () => {
    renderSheet()
    await userEvent.type(screen.getByRole("searchbox"), "qqq")
    expect(screen.getByText("Nothing found.")).toBeVisible()
  })

  it("appends a tapped result, clears the search, and closes", async () => {
    const onAppend = vi.fn()
    const onClose = vi.fn()
    renderSheet(onAppend, onClose)
    await userEvent.type(screen.getByRole("searchbox"), "ensi2")
    await userEvent.click(results()[0]!)
    expect(onAppend).toHaveBeenCalledExactlyOnceWith(PA + TE + SI)
    expect(onClose).toHaveBeenCalledOnce()
    expect(screen.getByRole("searchbox")).toHaveValue("")
  })

  it("opens a result's entry from its ⓘ, and goes back to the results", async () => {
    renderSheet()
    await userEvent.type(screen.getByRole("searchbox"), "sza")
    await userEvent.click(screen.getByRole("button", { name: "About ŠA" }))
    expect(screen.getByRole("dialog", { name: "ŠA" })).toBeVisible()

    await userEvent.click(
      screen.getByRole("button", { name: "Back to results" }),
    )
    expect(screen.getByRole("searchbox")).toHaveValue("sza")
  })

  it("appends all the signs of a sequence from its entry, clears the search, and closes", async () => {
    const onAppend = vi.fn()
    const onClose = vi.fn()
    renderSheet(onAppend, onClose)
    await userEvent.type(screen.getByRole("searchbox"), "ensi2")
    await userEvent.click(
      screen.getByRole("button", { name: "About |PA.TE.SI|" }),
    )
    await userEvent.click(screen.getByRole("button", { name: "Append all" }))
    expect(onAppend).toHaveBeenCalledExactlyOnceWith(PA + TE + SI)
    expect(onClose).toHaveBeenCalledOnce()
    expect(screen.getByRole("searchbox")).toHaveValue("")
  })
})
