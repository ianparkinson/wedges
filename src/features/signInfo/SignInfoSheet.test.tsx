import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ŠA, smallDatabase } from "../../../test/smallDatabase"
import { SignInfoSheet } from "./SignInfoSheet"
import type { SignListEntry } from "./signListEntry"

const ša: SignListEntry = { kind: "sign", sign: smallDatabase.sign(ŠA)! }

describe("SignInfoSheet", () => {
  it("shows the entry in a dialog named after it", () => {
    render(
      <SignInfoSheet entry={ša} database={smallDatabase} onClose={() => {}} />,
    )
    expect(screen.getByRole("dialog", { name: "ŠA" })).toBeVisible()
  })

  it("shows nothing without an entry", () => {
    render(
      <SignInfoSheet
        entry={undefined}
        database={smallDatabase}
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
        entry={ša}
        database={smallDatabase}
        onClose={onClose}
        onAppend={onAppend}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Append" }))
    expect(onAppend).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })
})
