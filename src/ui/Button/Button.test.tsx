import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "./Button"

describe("Button", () => {
  it("calls onPress when pressed", async () => {
    const onPress = vi.fn()
    render(<Button onPress={onPress}>Clear</Button>)
    await userEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(onPress).toHaveBeenCalledOnce()
  })

  it("does nothing while disabled", async () => {
    const onPress = vi.fn()
    render(
      <Button onPress={onPress} isDisabled>
        Clear
      </Button>,
    )
    const button = screen.getByRole("button", { name: "Clear" })
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onPress).not.toHaveBeenCalled()
  })
})
