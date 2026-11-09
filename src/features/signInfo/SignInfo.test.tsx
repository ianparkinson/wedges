import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  AN,
  GA2,
  GA2_TIMES_AN,
  LAGAR,
  LAGAR_GUNU,
  PA,
  ŠA,
  SI,
  smallDatabase,
  TE,
} from "../../../test/smallDatabase"
import { SignInfo } from "./SignInfo"
import type { SignListEntry } from "./signListEntry"

const ša: SignListEntry = { kind: "sign", sign: smallDatabase.sign(ŠA)! }
const ensi: SignListEntry = {
  kind: "sequence",
  sequence: smallDatabase.sequence(PA + TE + SI)!,
}

const signEntry = (char: string): SignListEntry => ({
  kind: "sign",
  sign: smallDatabase.sign(char)!,
})

/** The text of the description beside a term, such as Parts. */
function fact(term: string): string | null | undefined {
  return screen.getByText(term, { selector: "dt" }).nextElementSibling
    ?.textContent
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

  it("shows a compound's parts, joined as its name joins them", () => {
    renderPanel(signEntry(GA2_TIMES_AN))
    expect(fact("Parts")).toBe(`${GA2} GA₂ × ${AN} AN`)
  })

  it("lists a sign's variants, with their modifiers", () => {
    renderPanel(signEntry(LAGAR))
    expect(fact("Variants")).toBe(`${LAGAR_GUNU} LAGAR@g, gunû`)
  })

  it("says which sign a variant is a variant of", () => {
    renderPanel(signEntry(LAGAR_GUNU))
    expect(fact("Variant of")).toBe(`${LAGAR} LAGAR, gunû`)
  })

  it("says nothing of parts or variants for a plain sign", () => {
    renderPanel(ša)
    expect(screen.queryByText("Parts")).not.toBeInTheDocument()
    expect(screen.queryByText("Variants")).not.toBeInTheDocument()
    expect(screen.queryByText("Variant of")).not.toBeInTheDocument()
  })
})
