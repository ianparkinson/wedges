import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { testFont } from "@test/testFont"

import { SkeletonEditor } from "./SkeletonEditor"

const style = { tailEnd: 2, taper: 2, legWidth: 0.2 }

function renderEditor(shapes?: readonly string[]) {
  render(
    <SkeletonEditor
      text="𒁹"
      shapes={shapes}
      font={testFont()}
      winkelhakenAngle={100}
      style={style}
      showGlyph
      showSkeleton
      onSave={() => Promise.resolve()}
      onDone={vi.fn()}
    />,
  )
  return {
    picture: screen.getByRole("application", { name: "Skeleton editor" }),
    text: () =>
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Shapes, one to a line",
      }).value,
  }
}

describe("SkeletonEditor", () => {
  beforeEach(() => {
    SVGSVGElement.prototype.getScreenCTM = () =>
      ({ a: 1, d: 1, e: 0, f: 0 }) as DOMMatrix
    SVGSVGElement.prototype.setPointerCapture = vi.fn()
  })

  it("duplicates and deletes the shape selected in the list", async () => {
    const { text } = renderEditor(["w 10 50 0 30 12"])
    await userEvent.click(screen.getByRole("cell", { name: "w 10 50 0 30 12" }))
    await userEvent.click(screen.getByRole("button", { name: "Duplicate (D)" }))
    expect(text()).toBe("w 10 50 0 30 12\nw 14 46 0 30 12")

    await userEvent.click(screen.getByRole("button", { name: "Delete (Del)" }))
    expect(text()).toBe("w 10 50 0 30 12")
  })

  it("chooses a tool with its key, and draws a sign's first shape", async () => {
    const { picture, text } = renderEditor()
    picture.focus()
    await userEvent.keyboard("k")
    fireEvent.pointerDown(picture, { clientX: 30, clientY: -40 })
    fireEvent.pointerUp(picture)
    expect(text()).toBe("k 30 40 0 14")
    expect(screen.getByText(/Drag a shape or its handles/)).toBeVisible()

    await userEvent.keyboard("{Delete}")
    expect(text()).toBe("")
  })

  it("leaves Esc to close the sign once back at the Select tool", async () => {
    const onPageKey = vi.fn()
    window.addEventListener("keydown", onPageKey)
    const { picture } = renderEditor(["w 10 50 0 30 12"])
    picture.focus()
    await userEvent.keyboard("w{Escape}")
    expect(onPageKey).not.toHaveBeenCalled()
    await userEvent.keyboard("{Escape}")
    window.removeEventListener("keydown", onPageKey)
    expect(onPageKey).toHaveBeenCalledTimes(1)
  })
})
