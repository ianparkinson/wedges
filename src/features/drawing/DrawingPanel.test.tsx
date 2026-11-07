import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { Stroke } from "@/core/strokes"

import { DrawingPanel } from "./DrawingPanel"

const horizontal: Stroke = {
  kind: "wedge",
  head: { x: 0, y: 50 },
  tail: { x: 100, y: 50 },
}
const vertical: Stroke = {
  kind: "wedge",
  head: { x: 50, y: 0 },
  tail: { x: 50, y: 100 },
}

describe("DrawingPanel", () => {
  it("undoes the last stroke", async () => {
    const onStrokesChange = vi.fn()
    render(
      <DrawingPanel
        strokes={[horizontal, vertical]}
        onStrokesChange={onStrokesChange}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Undo stroke" }))
    expect(onStrokesChange).toHaveBeenCalledWith([horizontal])
  })

  it("clears every stroke", async () => {
    const onStrokesChange = vi.fn()
    render(
      <DrawingPanel
        strokes={[horizontal, vertical]}
        onStrokesChange={onStrokesChange}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(onStrokesChange).toHaveBeenCalledWith([])
  })

  it("disables undo and clear while the pad is empty", () => {
    render(<DrawingPanel strokes={[]} onStrokesChange={() => {}} />)
    expect(screen.getByRole("button", { name: "Undo stroke" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled()
  })

  it("shows the buttons it is given in its row", () => {
    render(
      <DrawingPanel strokes={[]} onStrokesChange={() => {}}>
        <button type="button">Accept</button>
      </DrawingPanel>,
    )
    expect(screen.getByRole("button", { name: "Accept" })).toBeVisible()
  })
})
