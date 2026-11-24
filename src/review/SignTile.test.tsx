import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { testFont } from "@test/testFont"

import type { ReviewSign } from "./reviewSigns"
import { SignTile } from "./SignTile"

const style = { tailEnd: 2, taper: 2, legWidth: 0.2 }
const sign: ReviewSign = {
  key: "𒁹#0",
  text: "𒁹",
  name: "DIŠ",
  group: "simple",
  block: "main",
  shapes: ["w 22 70 270 70 4"],
  score: { overlap: 0.912, missed: 0.05, outside: 0.04, shapesOutside: [0.04] },
}

function renderTile(props: Partial<Parameters<typeof SignTile>[0]> = {}) {
  const onSelect = vi.fn()
  render(
    <SignTile
      sign={sign}
      font={testFont()}
      winkelhakenAngle={100}
      style={style}
      isSelected={false}
      onSelect={onSelect}
      {...props}
    />,
  )
  return onSelect
}

describe("SignTile", () => {
  it("shows the sign's name and overlap, and opens it when pressed", async () => {
    const onSelect = renderTile()
    await userEvent.click(screen.getByRole("button", { name: "DIŠ, 0.91" }))
    expect(onSelect).toHaveBeenCalledWith("𒁹#0")
  })

  it("says when a sign is still being scored", () => {
    renderTile({ sign: { ...sign, score: undefined } })
    expect(screen.getByRole("button", { name: "DIŠ, scoring…" })).toBeVisible()
  })

  it("names a glyph with no skeleton by its code point", () => {
    renderTile({
      sign: { ...sign, name: undefined, shapes: undefined, score: undefined },
    })
    expect(
      screen.getByRole("button", { name: "U+12079, no skeleton" }),
    ).toBeVisible()
  })

  it("shows which tile is selected", () => {
    renderTile({ isSelected: true })
    expect(screen.getByRole("button", { pressed: true })).toBeVisible()
  })
})
