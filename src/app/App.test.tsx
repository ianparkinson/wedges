import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { App } from "./App"

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

  it("links to the source repository", () => {
    render(<App />)
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/ianparkinson/wedges",
    )
  })
})
