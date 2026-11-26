import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { testFont } from "@test/testFont"

import { EditablePicture } from "./EditablePicture"

const style = { tailEnd: 2, taper: 2, legWidth: 0.2 }
const shapes = ["w 10 50 0 30 12", "k 60 50 0 14"]

function renderPicture(selected?: number) {
  const handlers = {
    onSelect: vi.fn(),
    onEdit: vi.fn<(shapes: readonly string[], continuing: boolean) => void>(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
  }
  const { container } = render(
    <EditablePicture
      text="𒁹"
      shapes={shapes}
      font={testFont()}
      winkelhakenAngle={100}
      style={style}
      selected={selected}
      {...handlers}
    />,
  )
  const picture = screen.getByRole("application", { name: "Skeleton editor" })
  return { ...handlers, container, picture }
}

describe("EditablePicture", () => {
  beforeEach(() => {
    // jsdom doesn't lay out SVG: put the picture at the screen's origin,
    // one pixel to the unit, so pointer positions are skeleton units with y
    // flipped.
    SVGSVGElement.prototype.getScreenCTM = () =>
      ({ a: 1, d: 1, e: 0, f: 0 }) as DOMMatrix
    SVGSVGElement.prototype.setPointerCapture = vi.fn()
  })

  it("selects a shape when it's pressed", () => {
    const { onSelect, container } = renderPicture()
    fireEvent.pointerDown(container.querySelectorAll("path")[2]!)
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it("moves a shape dragged by its body", () => {
    const { onEdit, container, picture } = renderPicture(0)
    const wedge = container.querySelectorAll("path")[1]!
    fireEvent.pointerDown(wedge, { clientX: 20, clientY: -50 })
    fireEvent.pointerMove(picture, { clientX: 23, clientY: -55 })
    fireEvent.pointerMove(picture, { clientX: 25, clientY: -60 })
    expect(onEdit.mock.calls).toEqual([
      [["w 13 55 0 30 12", shapes[1]], false],
      [["w 15 60 0 30 12", shapes[1]], true],
    ])
  })

  it("points a wedge by its tail-end handle, snapping to straight down", () => {
    const { onEdit, container, picture } = renderPicture(0)
    const tail = container.querySelector("circle[data-role=point]")!
    fireEvent.pointerDown(tail, { clientX: 40, clientY: -50 })
    fireEvent.pointerMove(picture, { clientX: 13, clientY: -10 })
    expect(onEdit).toHaveBeenLastCalledWith(
      ["w 10 50 270 40 12", shapes[1]],
      false,
    )
  })

  it("moves, turns and lengthens the selected shape with keys", async () => {
    const { onEdit, picture } = renderPicture(0)
    picture.focus()
    await userEvent.keyboard("{ArrowUp}{Shift>}{ArrowRight}{/Shift}[[=")
    expect(onEdit.mock.calls.map(([s]) => s[0])).toEqual([
      "w 10 51 0 30 12",
      "w 15 50 0 30 12",
      "w 10 50 1 30 12",
      "w 10 50 0 31 12",
    ])
  })

  it("keeps the arrow keys from reaching the page", async () => {
    const onPageKey = vi.fn()
    window.addEventListener("keydown", onPageKey)
    const { picture } = renderPicture(0)
    picture.focus()
    await userEvent.keyboard("{ArrowRight}")
    window.removeEventListener("keydown", onPageKey)
    expect(onPageKey).not.toHaveBeenCalled()
  })

  it("undoes and redoes", async () => {
    const { onUndo, onRedo, picture } = renderPicture()
    picture.focus()
    await userEvent.keyboard(
      "{Control>}z{/Control}{Control>}{Shift>}z{/Shift}{/Control}",
    )
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(onRedo).toHaveBeenCalledTimes(1)
  })
})
