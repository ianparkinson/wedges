import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StrictMode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Sheet } from "./Sheet"

describe("Sheet", () => {
  // A sheet left open pops its history entry as it unmounts, but the pop lands
  // in a later task. Wait for it, so that the next test starts on the app's
  // own entry and its back isn't swallowed by the pending one.
  afterEach(async () => {
    cleanup()
    await waitFor(() => {
      expect(history.state).toBeNull()
    })
  })

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

  it("closes when the browser goes back", async () => {
    const onClose = vi.fn()
    render(
      <Sheet isOpen onClose={onClose} title="Look up">
        Contents
      </Sheet>,
    )
    await waitFor(() => {
      expect(history.state).not.toBeNull()
    })

    history.back()
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  it("takes its entry out of the history when it closes some other way", async () => {
    const { rerender } = render(
      <Sheet isOpen onClose={() => {}} title="Look up">
        Contents
      </Sheet>,
    )
    await waitFor(() => {
      expect(history.state).not.toBeNull()
    })

    rerender(
      <Sheet isOpen={false} onClose={() => {}} title="Look up">
        Contents
      </Sheet>,
    )
    await waitFor(() => {
      expect(history.state).toBeNull()
    })
  })

  it("adds one entry when StrictMode opens it twice", async () => {
    const onClose = vi.fn()
    render(
      <StrictMode>
        <Sheet isOpen onClose={onClose} title="Look up">
          Contents
        </Sheet>
      </StrictMode>,
    )
    await waitFor(() => {
      expect(history.state).not.toBeNull()
    })

    history.back()
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce()
    })
    expect(history.state).toBeNull()
  })
})
