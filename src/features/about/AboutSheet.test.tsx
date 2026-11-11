import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AboutSheet } from "./AboutSheet"

describe("AboutSheet", () => {
  it("says how to draw a wedge and a Winkelhaken", () => {
    render(<AboutSheet isOpen onClose={() => {}} />)
    expect(screen.getByText("A wedge:").parentElement).toHaveTextContent(
      /drag towards its tail/,
    )
    expect(screen.getByText("A Winkelhaken:").parentElement).toHaveTextContent(
      /without lifting your finger/,
    )
  })

  it("links to the source repository", () => {
    render(<AboutSheet isOpen onClose={() => {}} />)
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/ianparkinson/wedges",
    )
  })

  it("sends bugs to GitHub issues, and questions and suggestions to discussions", () => {
    render(<AboutSheet isOpen onClose={() => {}} />)
    expect(screen.getByRole("link", { name: "report a bug" })).toHaveAttribute(
      "href",
      "https://github.com/ianparkinson/wedges/issues/new?title=",
    )
    expect(
      screen.getByRole("link", { name: "start a discussion" }),
    ).toHaveAttribute(
      "href",
      "https://github.com/ianparkinson/wedges/discussions/new/choose",
    )
  })

  it("names the licences of the code, the sign data and the font", () => {
    render(<AboutSheet isOpen onClose={() => {}} />)
    const licences = screen.getByRole("list")
    expect(licences).toHaveTextContent(/MIT licence/)
    expect(licences).toHaveTextContent(/Oracc Sign List, released under CC0/)
    expect(licences).toHaveTextContent(/SIL Open Font License/)
  })

  it("closes with its Close button", async () => {
    const onClose = vi.fn()
    render(<AboutSheet isOpen onClose={onClose} />)
    await userEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
