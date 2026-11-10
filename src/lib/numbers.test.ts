import { describe, expect, it } from "vitest"

import { clamp } from "./numbers"

describe("clamp", () => {
  it("leaves a value inside the range as it is", () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
  })

  it("moves a value outside the range to the nearer end", () => {
    expect(clamp(-3, 0, 1)).toBe(0)
    expect(clamp(7, 0, 1)).toBe(1)
  })
})
