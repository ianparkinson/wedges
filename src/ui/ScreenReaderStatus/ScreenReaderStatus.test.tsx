import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ScreenReaderStatus } from "./ScreenReaderStatus"

describe("ScreenReaderStatus", () => {
  it("is a status that screen readers announce", () => {
    render(<ScreenReaderStatus message="Copied" />)
    expect(screen.getByRole("status")).toHaveTextContent("Copied")
  })

  it("says nothing with an empty message", () => {
    render(<ScreenReaderStatus message="" />)
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
  })
})
