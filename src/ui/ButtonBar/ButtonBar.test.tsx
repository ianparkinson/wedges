import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button } from "../Button/Button"
import { ButtonBar } from "./ButtonBar"

describe("ButtonBar", () => {
  it("shows its buttons in order", () => {
    render(
      <ButtonBar>
        <Button onPress={() => {}}>Undo</Button>
        <Button onPress={() => {}}>Backspace</Button>
      </ButtonBar>,
    )
    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["Undo", "Backspace"])
  })
})
