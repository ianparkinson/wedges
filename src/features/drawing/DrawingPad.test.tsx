import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { drag } from "@test/drag"

import { DrawingPad } from "./DrawingPad"

function renderPad() {
  const onStroke = vi.fn()
  render(<DrawingPad strokes={[]} onStroke={onStroke} />)
  return { pad: screen.getByRole("img", { name: /Drawing pad/ }), onStroke }
}

describe("DrawingPad", () => {
  it("turns a straight drag into a wedge from where the finger landed", () => {
    const { pad, onStroke } = renderPad()
    drag(pad, { x: 10, y: 50 }, { x: 110, y: 50 })
    expect(onStroke).toHaveBeenCalledExactlyOnceWith({
      kind: "wedge",
      head: { x: 10, y: 50 },
      tail: { x: 110, y: 50 },
    })
  })

  describe("outside a secure context, with no coalesced events", () => {
    const original = Object.getOwnPropertyDescriptor(
      PointerEvent.prototype,
      "getCoalescedEvents",
    )!
    afterEach(() => {
      Object.defineProperty(
        PointerEvent.prototype,
        "getCoalescedEvents",
        original,
      )
    })

    it("still follows the drag", () => {
      // Browsers leave it out over plain HTTP, such as to a phone on the
      // local network.
      Object.defineProperty(PointerEvent.prototype, "getCoalescedEvents", {
        value: undefined,
      })
      const { pad, onStroke } = renderPad()
      drag(pad, { x: 10, y: 50 }, { x: 110, y: 50 })
      expect(onStroke).toHaveBeenCalledExactlyOnceWith({
        kind: "wedge",
        head: { x: 10, y: 50 },
        tail: { x: 110, y: 50 },
      })
    })
  })

  it("ignores a tap", () => {
    const { pad, onStroke } = renderPad()
    drag(pad, { x: 10, y: 50 }, { x: 12, y: 50 })
    expect(onStroke).not.toHaveBeenCalled()
  })

  it("follows only the first finger down", () => {
    const { pad, onStroke } = renderPad()
    fireEvent.pointerDown(pad, { pointerId: 1, clientX: 10, clientY: 50 })
    drag(pad, { x: 10, y: 10 }, { x: 10, y: 110 }, 2)
    expect(onStroke).not.toHaveBeenCalled()
  })

  it("drops a stroke the browser cancels", () => {
    const { pad, onStroke } = renderPad()
    fireEvent.pointerDown(pad, { pointerId: 1, clientX: 10, clientY: 50 })
    fireEvent.pointerMove(pad, { pointerId: 1, clientX: 100, clientY: 50 })
    fireEvent.pointerCancel(pad, { pointerId: 1 })
    fireEvent.pointerUp(pad, { pointerId: 1, clientX: 100, clientY: 50 })
    expect(onStroke).not.toHaveBeenCalled()
  })

  it("says how many strokes it holds", () => {
    render(
      <DrawingPad
        strokes={[
          { kind: "wedge", head: { x: 0, y: 0 }, tail: { x: 0, y: 50 } },
        ]}
        onStroke={() => {}}
      />,
    )
    expect(
      screen.getByRole("img", { name: "Drawing pad, 1 stroke" }),
    ).toBeInTheDocument()
  })
})
