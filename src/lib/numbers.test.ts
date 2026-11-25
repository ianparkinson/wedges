import { describe, expect, it } from "vitest"

import { clamp, maxOf, minOf } from "./numbers"

describe("clamp", () => {
  it("leaves a value inside the range as it is", () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
  })

  it("moves a value outside the range to the nearer end", () => {
    expect(clamp(-3, 0, 1)).toBe(0)
    expect(clamp(7, 0, 1)).toBe(1)
  })
})

describe("minOf and maxOf", () => {
  it("find the smallest and largest value", () => {
    expect(minOf([3, -1, 2])).toBe(-1)
    expect(maxOf([3, -1, 2])).toBe(3)
  })

  it("give Infinity and -Infinity for no values, as Math.min and Math.max do", () => {
    expect(minOf([])).toBe(Infinity)
    expect(maxOf([])).toBe(-Infinity)
  })

  it("give NaN if any value is NaN, as Math.min and Math.max do", () => {
    expect(minOf([1, NaN])).toBeNaN()
    expect(maxOf([1, NaN])).toBeNaN()
  })

  it("handle more values than a call can take as arguments", () => {
    const many = Array.from({ length: 1_000_000 }, (_, i) => i)
    expect(minOf(many)).toBe(0)
    expect(maxOf(many)).toBe(999_999)
  })
})
