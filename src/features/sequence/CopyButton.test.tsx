import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { CopyButton } from "./CopyButton"

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("CopyButton", () => {
  it("copies the text, and says so on the button and to screen readers", async () => {
    // setup() gives jsdom a clipboard that the test can read back.
    const user = userEvent.setup()
    render(<CopyButton text="𒀭𒅗" />)

    await user.click(screen.getByRole("button", { name: "Copy" }))
    expect(await navigator.clipboard.readText()).toBe("𒀭𒅗")
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Copied"),
    )
    expect(screen.getByRole("button", { name: "Copied" })).toBeVisible()
  })

  it("goes back to Copy after a couple of seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<CopyButton text="𒀭" />)

    await user.click(screen.getByRole("button", { name: "Copy" }))
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Copied"),
    )
    await act(() => vi.advanceTimersByTimeAsync(2000))
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
    expect(screen.getByRole("button", { name: "Copy" })).toBeVisible()
  })

  it("says so when the browser refuses to copy", async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new DOMException("Denied", "NotAllowedError"),
    )
    vi.spyOn(console, "warn").mockImplementation(() => {})
    render(<CopyButton text="𒀭" />)

    await user.click(screen.getByRole("button", { name: "Copy" }))
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Not copied"),
    )
  })

  it("is disabled when there is nothing to copy", () => {
    userEvent.setup()
    render(<CopyButton text="" />)
    expect(screen.getByRole("button", { name: "Copy" })).toBeDisabled()
  })

  it("is disabled where the page has no clipboard", () => {
    // As on a page served over plain HTTP.
    vi.spyOn(navigator, "clipboard", "get").mockReturnValue(
      undefined as unknown as Clipboard,
    )
    render(<CopyButton text="𒀭" />)
    expect(screen.getByRole("button", { name: "Copy" })).toBeDisabled()
  })
})
