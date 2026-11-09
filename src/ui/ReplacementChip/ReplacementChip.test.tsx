import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ReplacementChip } from "./ReplacementChip"

describe("ReplacementChip", () => {
  it("shows the signs and their replacement, named by what it does", async () => {
    const onPress = vi.fn()
    render(
      <ReplacementChip
        onPress={onPress}
        from="𒂷𒀭"
        to="𒂼"
        aria-label="Combine into |GA₂×AN|"
      />,
    )
    const chip = screen.getByRole("button", { name: "Combine into |GA₂×AN|" })
    expect(chip).toHaveTextContent("𒂷𒀭𒂼")
    await userEvent.click(chip)
    expect(onPress).toHaveBeenCalledOnce()
  })
})
