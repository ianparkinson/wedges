import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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
  render(
    <SignTile
      sign={sign}
      font={testFont()}
      winkelhakenAngle={100}
      style={style}
      {...props}
    />,
  )
}

describe("SignTile", () => {
  it("shows the sign's name and overlap", () => {
    renderTile()
    expect(screen.getByRole("figure", { name: "DIŠ, 0.91" })).toBeVisible()
  })

  it("says when a sign is still being scored", () => {
    renderTile({ sign: { ...sign, score: undefined } })
    expect(screen.getByRole("figure", { name: "DIŠ, scoring…" })).toBeVisible()
  })

  it("names a glyph with no skeleton by its code point", () => {
    renderTile({
      sign: { ...sign, name: undefined, shapes: undefined, score: undefined },
    })
    expect(
      screen.getByRole("figure", { name: "U+12079, no skeleton" }),
    ).toBeVisible()
  })
})
