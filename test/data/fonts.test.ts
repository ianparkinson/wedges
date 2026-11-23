import { createHash } from "node:crypto"
import { readdirSync, readFileSync } from "node:fs"
import { basename } from "node:path"

import { describe, expect, it } from "vitest"

import type { SkeletonFile } from "@/core/types"

/** The font file in `data/fonts/` that each skeleton file describes. */
const fontFiles: Readonly<Record<string, string>> = {
  noto: "noto/NotoSansCuneiform-Regular.ttf",
}

const skeletonIds = readdirSync("data/skeletons").map((name) =>
  basename(name, ".json"),
)

it("names a font for each skeleton file, and only for those", () => {
  expect(Object.keys(fontFiles).toSorted()).toEqual(skeletonIds.toSorted())
})

describe.each(skeletonIds)("data/skeletons/%s.json", (id) => {
  const path = `data/skeletons/${id}.json`
  const { font } = JSON.parse(readFileSync(path, "utf8")) as SkeletonFile

  it("was traced over its font", () => {
    // A font update can move glyphs, so after one, check the skeletons
    // against the new font before updating the hash.
    const bytes = readFileSync(`data/fonts/${fontFiles[id]}`)
    const sha256 = createHash("sha256").update(bytes).digest("hex")
    expect(sha256).toBe(font.sha256)
  })
})
