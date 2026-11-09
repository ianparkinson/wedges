import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Chip } from "./Chip"

describe("Chip", () => {
  it("is a button showing its content", async () => {
    const onPress = vi.fn()
    render(<Chip onPress={onPress}>SI</Chip>)
    await userEvent.click(screen.getByRole("button", { name: "SI" }))
    expect(onPress).toHaveBeenCalledOnce()
  })

  it("can be named apart from its content", () => {
    render(
      <Chip onPress={() => {}} aria-label="Swap for SI@g">
        𒋛
      </Chip>,
    )
    expect(screen.getByRole("button")).toHaveAccessibleName("Swap for SI@g")
  })
})
