import { readdirSync, readFileSync } from "node:fs"
import { basename } from "node:path"

import { describe, expect, it } from "vitest"

import { parseShape } from "@/core/skeleton"
import type { SkeletonFile } from "@/core/types"
import { skeletonFonts } from "@/review/redraw/fonts"
import { glyph, readFont } from "@/review/redraw/glyphs"
import { redrawLimits as limits } from "@/review/redraw/limits"
import { redraw } from "@/review/redraw/redraw"

/** A sign's characters and code points, such as "𒀀 U+12000". */
function label(text: string): string {
  const codePoints = [...text].map(
    (c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase()}`,
  )
  return `${text} ${codePoints.join(" ")}`
}

const skeletonIds = readdirSync("data/skeletons").map((name) =>
  basename(name, ".json"),
)

it("leaves out only noto.json, which the next file replaces", () => {
  // noto.json is placeholder data, traced roughly by hand.
  expect(skeletonIds.filter((id) => !(id in limits))).toEqual(["noto"])
})

describe.each(Object.entries(limits))("data/skeletons/%s.json", (id, limit) => {
  const file = JSON.parse(
    readFileSync(`data/skeletons/${id}.json`, "utf8"),
  ) as SkeletonFile
  const { path, style } = skeletonFonts[id]!
  const bytes = readFileSync(`data/fonts/${path}`)
  const font = readFont(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  )
  const scores = file.skeletons
    .filter((entry) => entry.shapes)
    .map(({ text, shapes = [] }) => {
      const { score } = redraw(
        glyph(font, text)!,
        shapes.map(parseShape),
        file.winkelhakenAngle,
        style,
      )
      return { text, shapes, ...score }
    })

  it("redraws each sign close to its glyph", () => {
    const poor = scores
      .filter((s) => s.overlap < limit.overlap)
      .map((s) => `${label(s.text)} ${s.overlap.toFixed(2)}`)
    expect(poor).toEqual([])
  })

  it("keeps each shape on the ink", () => {
    const astray = scores.flatMap((s) =>
      s.shapes
        .filter((_, i) => s.shapesOutside[i]! > limit.shapeOutside)
        .map((shape) => `${label(s.text)}: ${shape}`),
    )
    expect(astray).toEqual([])
  })
})
