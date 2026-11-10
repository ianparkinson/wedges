import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { Change, Suggestions } from "@/core/suggest"

import {
  AN,
  GA2,
  GA2_TIMES_AN,
  PA,
  SI,
  smallDatabase,
  TE,
} from "../../../test/smallDatabase"
import { SuggestionRow, type SuggestionRowProps } from "./SuggestionRow"

const si = smallDatabase.sign(SI)!
const paTeSi = smallDatabase.sequence(PA + TE + SI)!
const combine: Change = {
  kind: "combine",
  replaced: GA2 + AN,
  chars: GA2_TIMES_AN,
}
const split: Change = {
  kind: "split",
  replaced: GA2_TIMES_AN,
  chars: GA2 + AN,
}

function renderRow(
  suggestions: Partial<Suggestions>,
  handlers: Partial<Pick<SuggestionRowProps, "onOpen" | "onChange">> = {},
) {
  render(
    <SuggestionRow
      suggestions={{
        changes: [],
        sign: undefined,
        sequences: [],
        ...suggestions,
      }}
      onOpen={handlers.onOpen ?? (() => {})}
      onChange={handlers.onChange ?? (() => {})}
      nameOf={(char) => smallDatabase.sign(char)?.name}
    />,
  )
}

describe("SuggestionRow", () => {
  it("offers the sign first, then the sequence, each by name with its readings", () => {
    renderRow({ sign: si, sequences: [paTeSi] })
    expect(
      screen.getAllByRole("button").map((chip) => chip.textContent),
    ).toEqual(["SI si", "|PA.TE.SI| ensag, ensi₂, ensik"])
  })

  it("opens the entry for the chip tapped", async () => {
    const onOpen = vi.fn()
    renderRow({ sign: si, sequences: [paTeSi] }, { onOpen })
    await userEvent.click(screen.getByRole("button", { name: /ensi₂/ }))
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(paTeSi)
  })

  it("offers changes after the entries, each from the signs it replaces to its own, named by what it does", () => {
    renderRow({ changes: [combine], sign: si })
    const chips = screen.getAllByRole("button")
    expect(chips.map((chip) => chip.textContent)).toEqual([
      "SI si",
      GA2 + AN + GA2_TIMES_AN,
    ])
    expect(chips[1]).toHaveAccessibleName("Combine into |GA₂×AN|")
  })

  it("names a split by every part", () => {
    renderRow({ changes: [split] })
    expect(screen.getByRole("button")).toHaveAccessibleName(
      "Split into GA₂ and AN",
    )
  })

  it("makes the change tapped", async () => {
    const onChange = vi.fn()
    renderRow({ changes: [combine] }, { onChange })
    await userEvent.click(screen.getByRole("button", { name: /Combine/ }))
    expect(onChange).toHaveBeenCalledExactlyOnceWith(combine)
  })

  it("is an empty row when there is nothing before the cursor", () => {
    renderRow({})
    expect(
      screen.getByRole("group", { name: "Suggestions" }),
    ).toBeEmptyDOMElement()
  })

  it("fades an edge in proportion to how far the row could scroll that way", () => {
    renderRow({ sign: si, sequences: [paTeSi] })
    const row = screen.getByRole("group", { name: "Suggestions" })
    Object.defineProperties(row, {
      scrollWidth: { value: 500 },
      clientWidth: { value: 300 },
    })

    row.scrollLeft = 10
    fireEvent.scroll(row)
    expect(row.style.getPropertyValue("--fade-start")).toBe("10px")
    expect(row.style.getPropertyValue("--fade-end")).toBe("24px")

    row.scrollLeft = 200
    fireEvent.scroll(row)
    expect(row.style.getPropertyValue("--fade-start")).toBe("24px")
    expect(row.style.getPropertyValue("--fade-end")).toBe("0px")
  })
})
