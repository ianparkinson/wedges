import { copyFile, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import type { SkeletonFile } from "../../src/core/types"
import { readEdit, saveShapes, withShapes } from "./saveShapes.ts"

const file: SkeletonFile = {
  version: 2,
  font: {
    family: "Test",
    version: "1",
    unitsPerEm: 1000,
    sha256: "0".repeat(64),
  },
  wedges: "tapered",
  headLean: 0,
  winkelhakenAngle: 100,
  skeletons: [
    { text: "𒀀", shapes: ["w 21 73 270 84 20"] },
    { text: "𒀉", shapes: ["w 11 -2 0 52 21"], comments: "First form" },
    { text: "𒀉", shapes: ["k 58 51 0 14"] },
  ],
}

const edit = {
  file: "noto-next",
  text: "𒀉",
  occurrence: 1,
  shapes: ["w 11 62 0 93 20"],
}

describe("readEdit", () => {
  it("reads an edit, tidying the spaces in its shapes", () => {
    expect(readEdit({ ...edit, shapes: [" w  11 62 0 93 20 "] })).toEqual(edit)
  })

  it("refuses a file name that could reach outside data/skeletons", () => {
    expect(() => readEdit({ ...edit, file: "../package" })).toThrow(/file/)
  })

  it("refuses an edit with no shapes", () => {
    expect(() => readEdit({ ...edit, shapes: [] })).toThrow(/No shapes/)
    expect(() => readEdit({ ...edit, shapes: [3] })).toThrow(/No shapes/)
  })

  it("refuses an entry number that isn't a whole number from 0", () => {
    expect(() => readEdit({ ...edit, occurrence: -1 })).toThrow(/entry/)
    expect(() => readEdit({ ...edit, occurrence: "1" })).toThrow(/entry/)
  })
})

describe("withShapes", () => {
  it("replaces the shapes of the given entry for the text, keeping its comments", () => {
    const first = withShapes(file, { ...edit, occurrence: 0 })
    expect(first.skeletons[1]).toEqual({
      text: "𒀉",
      shapes: ["w 11 62 0 93 20"],
      comments: "First form",
    })
    expect(first.skeletons[2]).toBe(file.skeletons[2])
  })

  it("adds an entry for a sign with none", () => {
    const added = withShapes(file, { ...edit, text: "𒀊", occurrence: 0 })
    expect(added.skeletons.at(-1)).toEqual({
      text: "𒀊",
      shapes: ["w 11 62 0 93 20"],
    })
  })

  it("refuses an entry more than one past the last for the text", () => {
    expect(() => withShapes(file, { ...edit, occurrence: 3 })).toThrow(
      /No entry 3/,
    )
  })
})

describe("saveShapes", () => {
  /** A folder like the repo's, holding the schema and `file` as noto-next.json. */
  async function repo() {
    const root = await mkdtemp(join(tmpdir(), "save-shapes-"))
    await mkdir(join(root, "data", "skeletons"), { recursive: true })
    await mkdir(join(root, "data", "schemas"))
    await copyFile(
      "data/schemas/skeletons.schema.json",
      join(root, "data", "schemas", "skeletons.schema.json"),
    )
    const path = join(root, "data", "skeletons", "noto-next.json")
    await writeFile(path, JSON.stringify(file))
    return { root, path }
  }

  it("writes the shapes in order", async () => {
    const { root, path } = await repo()
    await saveShapes(root, {
      ...edit,
      occurrence: 0,
      shapes: ["w 30 50 0 20 10", "w 10 50 0 20 10"],
    })
    const saved = JSON.parse(await readFile(path, "utf8")) as SkeletonFile
    expect(saved.skeletons[1]!.shapes).toEqual([
      "w 10 50 0 20 10",
      "w 30 50 0 20 10",
    ])
  })

  it("leaves the file as it was when the edit doesn't match the schema", async () => {
    const { root, path } = await repo()
    const before = await readFile(path, "utf8")
    await expect(
      saveShapes(root, { ...edit, shapes: ["w 1 2 3"] }),
    ).rejects.toThrow(/Can't save/)
    expect(await readFile(path, "utf8")).toBe(before)
  })
})
