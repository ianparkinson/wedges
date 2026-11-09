import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { InfoChip } from "./InfoChip"

describe("InfoChip", () => {
  it("is a button named by its label and detail", async () => {
    const onPress = vi.fn()
    render(<InfoChip onPress={onPress} label="|PA.TE.SI|" detail="ensi₂" />)
    await userEvent.click(
      screen.getByRole("button", { name: "|PA.TE.SI| ensi₂" }),
    )
    expect(onPress).toHaveBeenCalledOnce()
  })

  it("can have a label alone", () => {
    render(<InfoChip onPress={() => {}} label="SI" />)
    expect(screen.getByRole("button")).toHaveAccessibleName("SI")
  })
})
