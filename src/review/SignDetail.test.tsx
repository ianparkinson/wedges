import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { testFont } from "@test/testFont"

import type { ReviewSign } from "./reviewSigns"
import { SignDetail } from "./SignDetail"

const style = { tailEnd: 2, taper: 2, legWidth: 0.2 }
const sign: ReviewSign = {
  key: "𒁹#0",
  text: "𒁹",
  name: "DIŠ",
  group: "simple",
  block: "main",
  shapes: ["w 22 70 270 70 4", "w 60 70 270 30 4"],
}

function renderDetail(props: Partial<Parameters<typeof SignDetail>[0]> = {}) {
  const handlers = {
    onReviewedChange: vi.fn(),
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onClose: vi.fn(),
  }
  const { container } = render(
    <SignDetail
      sign={sign}
      font={testFont()}
      winkelhakenAngle={100}
      style={style}
      limits={{ overlap: 0.75, shapeOutside: 0.3 }}
      isReviewed={false}
      {...handlers}
      {...props}
    />,
  )
  return { ...handlers, container }
}

describe("SignDetail", () => {
  it("lists each shape with how much of it lies outside the ink", () => {
    renderDetail()
    const rows = screen.getAllByRole("row").slice(1)
    expect(rows.map((r) => r.textContent)).toEqual([
      "1w 22 70 270 70 40%",
      "2w 60 70 270 30 4100%",
    ])
  })

  it("scores the sign against its glyph", () => {
    renderDetail()
    expect(screen.getByText(/^Overlap 0\.\d+ · missed/)).toBeVisible()
  })

  it("hides the glyph or the skeleton", async () => {
    const { container } = renderDetail()
    const paths = () => container.querySelectorAll("svg path").length
    expect(paths()).toBe(3)
    await userEvent.click(screen.getByRole("checkbox", { name: "Glyph" }))
    expect(paths()).toBe(2)
    await userEvent.click(screen.getByRole("checkbox", { name: "Skeleton" }))
    expect(paths()).toBe(0)
  })

  it("marks the sign reviewed", async () => {
    const { onReviewedChange } = renderDetail()
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Reviewed (R)" }),
    )
    expect(onReviewedChange).toHaveBeenCalledWith(true)
  })

  it("moves to the previous and next signs", async () => {
    const { onPrevious, onNext } = renderDetail()
    await userEvent.click(screen.getByRole("button", { name: "Previous (←)" }))
    await userEvent.click(screen.getByRole("button", { name: "Next (→)" }))
    expect(onPrevious).toHaveBeenCalled()
    expect(onNext).toHaveBeenCalled()
  })

  it("says when there's no skeleton", () => {
    renderDetail({ sign: { ...sign, shapes: undefined } })
    expect(screen.getByText("No skeleton.")).toBeVisible()
    expect(screen.queryByRole("checkbox", { name: "Reviewed (R)" })).toBeNull()
  })
})
