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
    onShowGlyphChange: vi.fn(),
    onShowSkeletonChange: vi.fn(),
    onExpandedChange: vi.fn(),
    onReviewedChange: vi.fn(),
    onSave: vi.fn<(shapes: readonly string[]) => Promise<void>>(() =>
      Promise.resolve(),
    ),
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
      showGlyph
      showSkeleton
      isExpanded={false}
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

  it("hides the glyph or the skeleton", () => {
    const paths = (props: Parameters<typeof renderDetail>[0]) =>
      renderDetail(props).container.querySelectorAll("svg path").length
    expect(paths({})).toBe(3)
    expect(paths({ showGlyph: false })).toBe(2)
    expect(paths({ showGlyph: false, showSkeleton: false })).toBe(0)
  })

  it("asks to show or hide the glyph and the skeleton", async () => {
    const { onShowGlyphChange, onShowSkeletonChange } = renderDetail()
    await userEvent.click(screen.getByRole("checkbox", { name: "Glyph (G)" }))
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Skeleton (S)" }),
    )
    expect(onShowGlyphChange).toHaveBeenCalledWith(false)
    expect(onShowSkeletonChange).toHaveBeenCalledWith(false)
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

  describe("editing", () => {
    const shapesField = () =>
      screen.getByRole("textbox", { name: "Shapes, one to a line" })

    it("redraws the shapes as they're typed, and saves them", async () => {
      const { onSave } = renderDetail()
      await userEvent.click(screen.getByRole("button", { name: "Edit shapes" }))
      expect(shapesField()).toHaveValue("w 22 70 270 70 4\nw 60 70 270 30 4")

      await userEvent.clear(shapesField())
      await userEvent.type(shapesField(), "w 22 70 270 60 4")
      expect(screen.getAllByRole("row").slice(1)).toHaveLength(1)

      await userEvent.click(
        screen.getByRole("button", { name: "Save (Ctrl+Enter)" }),
      )
      expect(onSave).toHaveBeenCalledWith(["w 22 70 270 60 4"])
      expect(screen.queryByRole("textbox")).toBeNull()
    })

    it("won't save a line that isn't a shape", async () => {
      renderDetail()
      await userEvent.click(screen.getByRole("button", { name: "Edit shapes" }))
      await userEvent.type(shapesField(), "\nw 1 2")
      expect(
        screen.getByRole("list", { name: "Not shapes" }),
      ).toHaveTextContent("Line 3: w 1 2")
      expect(
        screen.getByRole("button", { name: "Save (Ctrl+Enter)" }),
      ).toBeDisabled()
    })

    it("says why a save failed, and keeps the edit", async () => {
      renderDetail({
        onSave: () => Promise.reject(new Error("Can't save: bad shape")),
      })
      await userEvent.click(screen.getByRole("button", { name: "Edit shapes" }))
      await userEvent.type(shapesField(), "{Control>}{Enter}{/Control}")
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Can't save: bad shape",
      )
      expect(shapesField()).toBeVisible()
    })

    it("cancels the edit with Esc", async () => {
      renderDetail()
      await userEvent.click(screen.getByRole("button", { name: "Edit shapes" }))
      await userEvent.type(shapesField(), "{Escape}")
      expect(screen.queryByRole("textbox")).toBeNull()
    })

    it("adds shapes to a sign with none", async () => {
      renderDetail({ sign: { ...sign, shapes: undefined } })
      await userEvent.click(screen.getByRole("button", { name: "Add shapes" }))
      expect(shapesField()).toHaveValue("")
    })
  })
})
