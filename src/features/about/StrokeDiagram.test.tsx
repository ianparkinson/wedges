import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { Wedge } from "@/core/strokes"

import { StrokeDiagram } from "./StrokeDiagram"

const WEDGE: Wedge = {
  kind: "wedge",
  head: { x: 10, y: 10 },
  tail: { x: 90, y: 10 },
}
const PATH = [
  { x: 10, y: 40 },
  { x: 90, y: 40 },
]

describe("StrokeDiagram", () => {
  it("is hidden from assistive technology, since the text beside it says the same", () => {
    const { container } = render(<StrokeDiagram stroke={WEDGE} path={PATH} />)
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    )
  })

  it("marks where the finger lands and points the arrow at where it lifts", () => {
    const { container } = render(<StrokeDiagram stroke={WEDGE} path={PATH} />)
    const start = container.querySelector("circle")
    expect(start).toHaveAttribute("cx", "10")
    expect(start).toHaveAttribute("cy", "40")
    expect(container.querySelector("path[marker-end]")).toHaveAttribute(
      "d",
      "M10 40L90 40",
    )
  })

  it("gives each diagram's arrowhead its own id", () => {
    const { container } = render(
      <>
        <StrokeDiagram stroke={WEDGE} path={PATH} />
        <StrokeDiagram stroke={WEDGE} path={PATH} />
      </>,
    )
    const ids = [...container.querySelectorAll("marker")].map((m) => m.id)
    expect(new Set(ids).size).toBe(2)
  })
})
