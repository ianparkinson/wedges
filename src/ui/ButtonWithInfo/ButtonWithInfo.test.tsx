import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ButtonWithInfo } from "./ButtonWithInfo"

function renderButton() {
  const onPress = vi.fn()
  const onInfo = vi.fn()
  render(
    <ButtonWithInfo onPress={onPress} infoLabel="About AN" onInfo={onInfo}>
      AN
    </ButtonWithInfo>,
  )
  return { onPress, onInfo }
}

describe("ButtonWithInfo", () => {
  it("presses the button, not the ⓘ, when the button is tapped", async () => {
    const { onPress, onInfo } = renderButton()
    await userEvent.click(screen.getByRole("button", { name: "AN" }))
    expect(onPress).toHaveBeenCalledOnce()
    expect(onInfo).not.toHaveBeenCalled()
  })

  it("presses the ⓘ, named by its label, not the button", async () => {
    const { onPress, onInfo } = renderButton()
    await userEvent.click(screen.getByRole("button", { name: "About AN" }))
    expect(onInfo).toHaveBeenCalledOnce()
    expect(onPress).not.toHaveBeenCalled()
  })
})
