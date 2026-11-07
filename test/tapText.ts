import { fireEvent, screen } from "@testing-library/react"
import { vi } from "vitest"

/** The width of each sign in the text, in CSS pixels. */
const SIGN_WIDTH = 40

/** The height of the line of signs, in CSS pixels. */
const LINE_HEIGHT = 50

/**
 * Taps the text at `x` pixels from its left edge, with its signs laid out in
 * one row, each 40 pixels wide. jsdom does no layout of its own, so the
 * signs' boxes are made up.
 */
export function tapText(x: number) {
  const signs = screen.getAllByRole("option")
  signs.forEach((sign, i) => {
    vi.spyOn(sign, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({
        x: i * SIGN_WIDTH,
        y: 0,
        width: SIGN_WIDTH,
        height: LINE_HEIGHT,
      }),
    )
  })
  fireEvent.click(screen.getByRole("listbox"), {
    clientX: x,
    clientY: LINE_HEIGHT / 2,
  })
}
