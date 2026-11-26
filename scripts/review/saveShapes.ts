/**
 * Saves one sign's shapes into a skeleton file, for the review page's
 * editing. The file is read again just before it's written, so any other
 * changes made to it meanwhile, by hand or by another tool, are kept, and
 * checked against its schema, so a bad edit never reaches it.
 */
import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { Ajv2020 } from "ajv/dist/2020.js"

import type { SkeletonFile } from "../../src/core/types"
import { formatSkeletonFile } from "../skeletons/format.ts"

/** New shapes for one entry in a skeleton file. */
export interface ShapesEdit {
  /** The skeleton file's name in data/skeletons, without ".json". */
  readonly file: string
  readonly text: string
  /**
   * Which entry for `text` to change, counting from 0. One more than the
   * file has adds an entry.
   */
  readonly occurrence: number
  readonly shapes: readonly string[]
}

const FILE_NAME = /^[\w-]+$/

/**
 * Reads an edit from a request's JSON body, with single spaces in its
 * shapes. Throws, saying what's wrong, if it isn't one.
 */
export function readEdit(body: unknown): ShapesEdit {
  const { file, text, occurrence, shapes } = (body ?? {}) as Record<
    string,
    unknown
  >
  if (typeof file !== "string" || !FILE_NAME.test(file)) {
    throw new Error(`Bad skeleton file name ${String(file)}`)
  }
  if (typeof text !== "string" || text === "") {
    throw new Error("No sign to save")
  }
  if (!Number.isInteger(occurrence) || (occurrence as number) < 0) {
    throw new Error(`Bad entry number ${String(occurrence)}`)
  }
  if (
    !Array.isArray(shapes) ||
    shapes.length === 0 ||
    !shapes.every((s) => typeof s === "string")
  ) {
    throw new Error("No shapes to save")
  }

  return {
    file,
    text,
    occurrence: occurrence as number,
    shapes: shapes.map((s: string) => s.trim().split(/\s+/).join(" ")),
  }
}

/**
 * The skeleton file with the edit's entry given the edit's shapes, or the
 * entry added. Throws if the entry is more than one past the file's last
 * entry for that text.
 */
export function withShapes(
  file: SkeletonFile,
  { text, occurrence, shapes }: ShapesEdit,
): SkeletonFile {
  const indices = file.skeletons.flatMap((entry, i) =>
    entry.text === text ? [i] : [],
  )
  if (occurrence > indices.length) {
    throw new Error(`No entry ${occurrence} for ${text}`)
  }

  const index = indices[occurrence]
  const skeletons =
    index === undefined
      ? [...file.skeletons, { text, shapes }]
      : file.skeletons.with(index, { ...file.skeletons[index]!, shapes })
  return { ...file, skeletons }
}

/**
 * Writes the edit into its file in data/skeletons below `root`. Throws,
 * leaving the file as it was, if the edited file doesn't match the schema in
 * data/schemas, such as for a shape with too few numbers.
 */
export async function saveShapes(root: string, edit: ShapesEdit) {
  const path = join(root, "data", "skeletons", `${edit.file}.json`)
  const schemaPath = join(root, "data", "schemas", "skeletons.schema.json")
  const file = JSON.parse(await readFile(path, "utf8")) as SkeletonFile
  const schema = JSON.parse(await readFile(schemaPath, "utf8")) as object

  const edited = withShapes(file, edit)
  const validate = new Ajv2020({ allErrors: true }).compile(schema)
  if (!validate(edited)) {
    throw new Error(`Can't save: ${new Ajv2020().errorsText(validate.errors)}`)
  }
  await writeFile(path, await formatSkeletonFile(path, edited))
}
