import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { drag } from "../../test/drag"
import { tapText } from "../../test/tapText"
import { App } from "./App"

/** Draws AN, 300 pixels across: a vertical wedge, a horizontal one and two diagonals. */
function drawAN(pad: HTMLElement) {
  drag(pad, { x: 150, y: 0 }, { x: 150, y: 300 })
  drag(pad, { x: 0, y: 150 }, { x: 300, y: 150 })
  drag(pad, { x: 42, y: 30 }, { x: 261, y: 240 })
  drag(pad, { x: 42, y: 240 }, { x: 264, y: 30 })
}

describe("App", () => {
  it("shows the app name as the main heading", () => {
    render(<App />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Wedges",
    )
  })

  it("opens on an empty drawing pad", () => {
    render(<App />)
    expect(
      screen.getByRole("img", { name: "Drawing pad, 0 strokes" }),
    ).toBeInTheDocument()
  })

  it("offers AN first when AN is drawn, and picking it adds it to the text and clears the pad", async () => {
    render(<App />)
    await screen.findByText(/Draw a sign/)
    const pad = screen.getByRole("img", { name: /Drawing pad/ })

    drawAN(pad)
    const candidates = screen.getByRole("region", { name: "Candidates" })
    expect(within(candidates).getAllByRole("button")[0]).toHaveAccessibleName(
      "AN",
    )

    await userEvent.click(screen.getByRole("button", { name: "Accept best" }))
    expect(screen.getByRole("option", { name: "AN" })).toBeVisible()
    expect(pad).toHaveAccessibleName("Drawing pad, 0 strokes")
  })

  it("inserts a picked sign at the cursor", async () => {
    render(<App />)
    await screen.findByText(/Draw a sign/)
    const pad = screen.getByRole("img", { name: /Drawing pad/ })
    const accept = screen.getByRole("button", { name: "Accept best" })
    drawAN(pad)
    await userEvent.click(accept)
    drawAN(pad)
    await userEvent.click(accept)
    tapText(45)

    drawAN(pad)
    await userEvent.click(accept)
    const signs = screen.getAllByRole("option")
    expect(signs).toHaveLength(3)
    expect(signs[1]).toHaveAttribute("aria-selected", "true")
  })

  it("keeps the text when the app is opened again", async () => {
    const { unmount } = render(<App />)
    await screen.findByText(/Draw a sign/)
    drawAN(screen.getByRole("img", { name: /Drawing pad/ }))
    await userEvent.click(screen.getByRole("button", { name: "Accept best" }))
    unmount()

    render(<App />)
    expect(await screen.findByRole("option", { name: "AN" })).toBeVisible()
  })

  it("appends a sign found with Look up to the text", async () => {
    render(<App />)
    await screen.findByText(/Draw a sign/)
    await userEvent.click(screen.getByRole("button", { name: "Look up" }))
    await userEvent.type(screen.getByRole("searchbox"), "sza")
    const results = screen.getByRole("list", { name: "Results" })
    await userEvent.click(within(results).getByRole("button", { name: "ŠA" }))

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("option", { name: "ŠA" })).toBeVisible()
  })

  it("shows a candidate's entry from its ⓘ, and appends it from there", async () => {
    render(<App />)
    await screen.findByText(/Draw a sign/)
    const pad = screen.getByRole("img", { name: /Drawing pad/ })
    drawAN(pad)

    await userEvent.click(screen.getByRole("button", { name: "About AN" }))
    expect(screen.getByRole("dialog", { name: "AN" })).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: "Append" }))

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("option", { name: "AN" })).toBeVisible()
    expect(pad).toHaveAccessibleName("Drawing pad, 0 strokes")
  })

  it("links to the source repository", () => {
    render(<App />)
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/ianparkinson/wedges",
    )
  })
})
