import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { PA, SI, smallDatabase, TE } from "../../../test/smallDatabase"
import { SuggestionRow } from "./SuggestionRow"

const si = smallDatabase.sign(SI)!
const paTeSi = smallDatabase.sequence(PA + TE + SI)!

describe("SuggestionRow", () => {
  it("offers the sign first, then the sequence, each by name with its readings", () => {
    render(
      <SuggestionRow
        suggestions={{ sign: si, sequences: [paTeSi] }}
        onOpen={() => {}}
      />,
    )
    expect(
      screen.getAllByRole("button").map((chip) => chip.textContent),
    ).toEqual(["SI si", "|PA.TE.SI| ensag, ensi₂, ensik"])
  })

  it("opens the entry for the chip tapped", async () => {
    const onOpen = vi.fn()
    render(
      <SuggestionRow
        suggestions={{ sign: si, sequences: [paTeSi] }}
        onOpen={onOpen}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: /ensi₂/ }))
    expect(onOpen).toHaveBeenCalledExactlyOnceWith({
      kind: "sequence",
      sequence: paTeSi,
    })
  })

  it("is an empty row when there is nothing before the cursor", () => {
    render(
      <SuggestionRow
        suggestions={{ sign: undefined, sequences: [] }}
        onOpen={() => {}}
      />,
    )
    expect(
      screen.getByRole("group", { name: "Suggestions" }),
    ).toBeEmptyDOMElement()
  })

  it("fades an edge in proportion to how far the row could scroll that way", () => {
    render(
      <SuggestionRow
        suggestions={{ sign: si, sequences: [paTeSi] }}
        onOpen={() => {}}
      />,
    )
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
