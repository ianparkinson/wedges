import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button } from "@/ui/Button/Button"

import { ButtonBar } from "./ButtonBar"

describe("ButtonBar", () => {
  it("shows its buttons in order, with the main one last", () => {
    render(
      <ButtonBar end={<Button onPress={() => {}}>Copy</Button>}>
        <Button onPress={() => {}}>Backspace</Button>
        <Button onPress={() => {}}>Clear</Button>
      </ButtonBar>,
    )
    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["Backspace", "Clear", "Copy"])
  })
})
