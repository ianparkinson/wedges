import { describe, expect, it } from "vitest"

import type { ReviewSign } from "./reviewSigns"
import { hasStatus, isFailing, sortSigns, type Status } from "./signFilters"

const limits = { overlap: 0.75, shapeOutside: 0.3 }

function sign(key: string, overlap?: number, shapesOutside = [0]): ReviewSign {
  return {
    key,
    text: key,
    group: "simple",
    block: "main",
    shapes: overlap === undefined ? undefined : shapesOutside.map(() => "w"),
    score:
      overlap === undefined
        ? undefined
        : { overlap, missed: 0, outside: 0, shapesOutside },
  }
}

const reviewed = {
  isReviewed: (text: string) => text === "a",
  setReviewed: () => {},
  setAllReviewed: () => {},
}

describe("isFailing", () => {
  it("fails a sign under the overlap limit, or with a shape too far off the ink", () => {
    expect(isFailing(sign("a", 0.9), limits)).toBe(false)
    expect(isFailing(sign("a", 0.7), limits)).toBe(true)
    expect(isFailing(sign("a", 0.9, [0.1, 0.4]), limits)).toBe(true)
  })

  it("holds a partial skeleton only to the shape limit", () => {
    const partial = (outside: number[]) => ({
      ...sign("a", 0.4, outside),
      partial: true,
    })
    expect(isFailing(partial([0.1]), limits)).toBe(false)
    expect(isFailing(partial([0.4]), limits)).toBe(true)
  })

  it("fails nothing in a file with no limits, or with no score", () => {
    expect(isFailing(sign("a", 0.1), undefined)).toBe(false)
    expect(isFailing(sign("a"), limits)).toBe(false)
  })
})

describe("hasStatus", () => {
  it("tells traced, untraced, reviewed, unreviewed and failing signs apart", () => {
    const signs = [sign("a", 0.9), sign("b", 0.5), sign("c")]
    const keys = (status: Status) =>
      signs
        .filter((r) => hasStatus(r, status, reviewed, limits))
        .map((r) => r.key)
    expect(keys("all")).toEqual(["a", "b", "c"])
    expect(keys("traced")).toEqual(["a", "b"])
    expect(keys("untraced")).toEqual(["c"])
    expect(keys("reviewed")).toEqual(["a"])
    expect(keys("unreviewed")).toEqual(["b"])
    expect(keys("failing")).toEqual(["b"])
  })
})

describe("sortSigns", () => {
  const signs = [sign("a", 0.9, [0.1]), sign("b", 0.8, [0.2]), sign("c")]

  it("keeps file order", () => {
    expect(sortSigns(signs, "file").map((r) => r.key)).toEqual(["a", "b", "c"])
  })

  it("puts the worst overlap first, and untraced signs last", () => {
    expect(sortSigns(signs, "overlap").map((r) => r.key)).toEqual([
      "b",
      "a",
      "c",
    ])
  })

  it("puts the sign with the worst shape first", () => {
    expect(sortSigns(signs, "shape outside").map((r) => r.key)).toEqual([
      "b",
      "a",
      "c",
    ])
  })
})
