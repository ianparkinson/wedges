import { Ajv2020 } from "ajv/dist/2020"
import { describe, expect, it } from "vitest"

import { parseShape } from "@/core/skeleton"
import { compareShapes, compareTexts } from "@/core/skeletonOrder"
import type { SkeletonFile } from "@/core/types"

import schema from "../../data/schemas/skeletons.schema.json"

const files = import.meta.glob<SkeletonFile>("../../data/skeletons/*.json", {
  eager: true,
  import: "default",
})

const entries = Object.entries(files).map(
  ([path, file]) => [path.replace("../../", ""), file] as const,
)

/** A shape's op, then its numbers. */
function tokens(shape: string): [string, ...number[]] {
  const [op = "", ...numbers] = shape.split(" ")
  return [op, ...numbers.map(Number)]
}

describe.each(entries)("%s", (_, file) => {
  const shapes = file.skeletons.flatMap((e) =>
    (e.shapes ?? []).map((shape) => ({ text: e.text, shape })),
  )

  it("matches its schema", () => {
    const validate = new Ajv2020({ allErrors: true }).compile(schema)
    expect(validate(file), JSON.stringify(validate.errors)).toBe(true)
  })

  it("lists skeletons in code point order", () => {
    const texts = file.skeletons.map((e) => e.text)
    expect(texts).toEqual(texts.toSorted(compareTexts))
  })

  it("lists each skeleton's shapes in order", () => {
    for (const { text, shapes = [] } of file.skeletons) {
      expect(shapes, text).toEqual(shapes.toSorted(compareShapes))
    }
  })

  it("writes directions from 0 to 359", () => {
    for (const { text, shape } of shapes) {
      const direction = tokens(shape)[3]!
      expect(direction, `${text}: ${shape}`).toBeGreaterThanOrEqual(0)
      expect(direction, `${text}: ${shape}`).toBeLessThan(360)
    }
  })

  it("gives every shape a positive length, and every wedge room for its head", () => {
    const headDepth = file.wedges === "headed" ? (file.headAspect ?? 0) : 0
    for (const { text, shape } of shapes) {
      const [op, , , , size = 0, head = 0] = tokens(shape)
      expect(size, `${text}: ${shape}`).toBeGreaterThan(0)
      if (op === "w") {
        expect(head, `${text}: ${shape}`).toBeGreaterThanOrEqual(0)
        expect(size, `${text}: ${shape}`).toBeGreaterThanOrEqual(
          headDepth * head,
        )
      }
    }
  })

  it("gives each Winkelhaken's own angle between 0 and 180", () => {
    for (const { text, shape } of shapes) {
      const [op, , , , , angle] = tokens(shape)
      if (op === "k" && angle !== undefined) {
        expect(angle, `${text}: ${shape}`).toBeGreaterThan(0)
        expect(angle, `${text}: ${shape}`).toBeLessThan(180)
      }
    }
  })

  it("starts each headless line at its top end if vertical, else its left end", () => {
    for (const { text, shape } of shapes) {
      const [op, , , direction = 0, , head] = tokens(shape)
      if (op === "w" && head === 0) {
        const rightwards = direction < 90 || direction > 270
        expect(rightwards || direction === 270, `${text}: ${shape}`).toBe(true)
      }
    }
  })

  it("has shapes that all parse", () => {
    for (const { text, shape } of shapes) {
      expect(() => parseShape(shape), text).not.toThrow()
    }
  })
})
