import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { InfoIcon } from "../InfoIcon/InfoIcon"
import { IconButton } from "./IconButton"

describe("IconButton", () => {
  it("is named by its label, not its icon", async () => {
    const onPress = vi.fn()
    render(
      <IconButton label="About AN" onPress={onPress}>
        <InfoIcon />
      </IconButton>,
    )
    await userEvent.click(screen.getByRole("button", { name: "About AN" }))
    expect(onPress).toHaveBeenCalledOnce()
  })
})
