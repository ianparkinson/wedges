import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ŠA, smallDatabase } from "../../../test/smallDatabase"
import { SignInfoSheet } from "./SignInfoSheet"

const ša = smallDatabase.sign(ŠA)!

describe("SignInfoSheet", () => {
  it("shows the sign in a dialog named after it", () => {
    render(
      <SignInfoSheet
        about={ša}
        signDatabase={smallDatabase}
        onClose={() => {}}
      />,
    )
    expect(screen.getByRole("dialog", { name: "ŠA" })).toBeVisible()
  })

  it("shows nothing without a sign", () => {
    render(
      <SignInfoSheet
        about={undefined}
        signDatabase={smallDatabase}
        onClose={() => {}}
      />,
    )
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("closes after appending", async () => {
    const onAppend = vi.fn()
    const onClose = vi.fn()
    render(
      <SignInfoSheet
        about={ša}
        signDatabase={smallDatabase}
        onClose={onClose}
        onAppend={onAppend}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Append" }))
    expect(onAppend).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })
})
