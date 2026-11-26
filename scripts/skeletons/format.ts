/**
 * Writes skeleton files the one way the repo keeps them, so that a tool
 * rewriting a file changes only what it must.
 */
import { format, resolveConfig } from "prettier"

import { sortSkeletonFile } from "../../src/core/skeletonOrder.ts"
import type { SkeletonFile } from "../../src/core/types"
import { escapePrivateUse } from "./privateUse.ts"

/**
 * The text of a skeleton file to be saved at `path`: entries and shapes in
 * order, private-use characters escaped, and formatted with Prettier.
 */
export async function formatSkeletonFile(
  path: string,
  file: SkeletonFile,
): Promise<string> {
  const json = escapePrivateUse(JSON.stringify(sortSkeletonFile(file), null, 2))
  const options = await resolveConfig(path)
  return format(json, { ...options, filepath: path })
}
