import { describe, expect, it } from "vitest"

import { parseSpec } from "./spec"

describe("parseSpec", () => {
  it("reads wedges head first, and Winkelhaken vertex first", () => {
    expect(parseSpec("w 5 0 5 10; h 2 5 8 2 8 8")).toEqual([
      { kind: "wedge", head: { x: 5, y: 0 }, tail: { x: 5, y: 10 } },
      {
        kind: "winkelhaken",
        vertex: { x: 2, y: 5 },
        legA: { x: 8, y: 2 },
        legB: { x: 8, y: 8 },
      },
    ])
  })

  it("ignores extra whitespace and empty items", () => {
    expect(parseSpec("  w 0 0 1 -0.5 ;; ")).toEqual([
      { kind: "wedge", head: { x: 0, y: 0 }, tail: { x: 1, y: -0.5 } },
    ])
    expect(parseSpec("")).toEqual([])
  })

  it.each(["x 0 0 10", "w 0 0 1", "w 0 0 1 x", "h 0 0 1 1 2", "w 0 0 1 1 2 2"])(
    'rejects "%s"',
    (spec) => {
      expect(() => parseSpec(spec)).toThrow(spec)
    },
  )
})
