import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Sheet } from "./Sheet"

describe("Sheet", () => {
  it("is a dialog named by its title", () => {
    render(
      <Sheet isOpen onClose={() => {}} title="Look up">
        Contents
      </Sheet>,
    )
    expect(screen.getByRole("dialog", { name: "Look up" })).toHaveTextContent(
      "Contents",
    )
  })

  it("shows nothing while closed", () => {
    render(
      <Sheet isOpen={false} onClose={() => {}} title="Look up">
        Contents
      </Sheet>,
    )
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("closes with its Close button", async () => {
    const onClose = vi.fn()
    render(
      <Sheet isOpen onClose={onClose} title="Look up">
        Contents
      </Sheet>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("closes with Escape", async () => {
    const onClose = vi.fn()
    render(
      <Sheet isOpen onClose={onClose} title="Look up">
        Contents
      </Sheet>,
    )
    await userEvent.keyboard("{Escape}")
    expect(onClose).toHaveBeenCalledOnce()
  })
})
