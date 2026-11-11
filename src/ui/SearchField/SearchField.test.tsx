import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SearchField } from "./SearchField"

function Field() {
  const [value, setValue] = useState("")
  return <SearchField label="Search" value={value} onChange={setValue} />
}

describe("SearchField", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("is a search box named by its label", async () => {
    render(<Field />)
    await userEvent.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "sza",
    )
    expect(screen.getByRole("searchbox")).toHaveValue("sza")
  })

  it("is cleared by its clear button", async () => {
    render(<Field />)
    await userEvent.type(screen.getByRole("searchbox"), "sza")
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }))
    expect(screen.getByRole("searchbox")).toHaveValue("")
  })

  it("autofocuses once it has been drawn", async () => {
    render(
      <SearchField label="Search" value="" onChange={() => {}} autoFocus />,
    )
    expect(screen.getByRole("searchbox")).not.toHaveFocus()
    await waitFor(() => expect(screen.getByRole("searchbox")).toHaveFocus())
  })

  it("autofocuses straight away on an iPhone, so its keyboard opens", () => {
    vi.spyOn(navigator, "platform", "get").mockReturnValue("iPhone")
    render(
      <SearchField label="Search" value="" onChange={() => {}} autoFocus />,
    )
    expect(screen.getByRole("searchbox")).toHaveFocus()
  })

  it("has no clear button while empty", () => {
    render(<Field />)
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument()
  })
})
