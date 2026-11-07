import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { drag } from "../../test/drag"
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

  it("offers AN first when AN is drawn, and picking it clears the pad", async () => {
    render(<App />)
    await screen.findByText(/Draw a sign/)
    const pad = screen.getByRole("img", { name: /Drawing pad/ })

    drawAN(pad)
    const candidates = screen.getByRole("region", { name: "Candidates" })
    expect(within(candidates).getAllByRole("button")[0]).toHaveAccessibleName(
      "AN",
    )

    await userEvent.click(screen.getByRole("button", { name: "Accept best" }))
    expect(
      screen.getByRole("status", { name: "Picked signs" }),
    ).toHaveTextContent("𒀭")
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
