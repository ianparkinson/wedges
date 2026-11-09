import { describe, expect, it } from "vitest"

import { groupBy } from "./collections"

describe("groupBy", () => {
  it("groups items by their key, keeping their order", () => {
    const groups = groupBy(["an", "ga", "ab", "gu"], (word) => word[0])
    expect([...groups]).toEqual([
      ["a", ["an", "ab"]],
      ["g", ["ga", "gu"]],
    ])
  })

  it("leaves out items with no key", () => {
    const groups = groupBy([1, 2, 3, 4], (n) => (n % 2 ? "odd" : undefined))
    expect([...groups]).toEqual([["odd", [1, 3]]])
  })
})
