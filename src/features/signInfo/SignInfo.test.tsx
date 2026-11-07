import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { PA, ŠA, SI, smallDatabase, TE } from "../../../test/smallDatabase"
import { SignInfo } from "./SignInfo"
import type { SignListEntry } from "./signListEntry"

const ša: SignListEntry = { kind: "sign", sign: smallDatabase.sign(ŠA)! }
const ensi: SignListEntry = {
  kind: "sequence",
  sequence: smallDatabase.sequence(PA + TE + SI)!,
}

function renderPanel(entry: SignListEntry, onAppend?: () => void) {
  render(
    <SignInfo entry={entry} database={smallDatabase} onAppend={onAppend} />,
  )
}

describe("SignInfo", () => {
  it("shows a sign's values and code point", () => {
    renderPanel(ša)
    expect(screen.getByText("ša, ša₃")).toBeVisible()
    expect(screen.getByText("U+122AD CUNEIFORM SIGN SHA")).toBeVisible()
  })

  it("links to the sign's page in the Oracc Sign List", () => {
    renderPanel(ša)
    expect(
      screen.getByRole("link", { name: "ŠA in the Oracc Sign List" }),
    ).toHaveAttribute("href", "https://oracc.museum.upenn.edu/osl/o0002824")
  })

  it("appends a sign with Append", async () => {
    const onAppend = vi.fn()
    renderPanel(ša, onAppend)
    await userEvent.click(screen.getByRole("button", { name: "Append" }))
    expect(onAppend).toHaveBeenCalledOnce()
  })

  it("offers no Append when there is nothing to append", () => {
    renderPanel(ša)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("lists the signs a sequence is made of, by name and code point", () => {
    renderPanel(ensi)
    const signs = screen.getAllByRole("listitem")
    expect(signs.map((sign) => sign.textContent)).toEqual([
      `${PA} PA U+1227A`,
      `${TE} TE U+122FC`,
      `${SI} SI U+122DB`,
    ])
  })

  it("offers Append all for a sequence", () => {
    renderPanel(ensi, () => {})
    expect(screen.getByRole("button", { name: "Append all" })).toBeVisible()
    expect(screen.getByText("ensag, ensi₂, ensik")).toBeVisible()
  })
})
