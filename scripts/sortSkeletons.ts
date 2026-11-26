/**
 * Puts skeleton files' entries and shapes back in order after hand edits,
 * escaping private-use code points, and formats them with Prettier. With no
 * files given, it sorts every file in data/skeletons:
 *
 *   npm run sort-skeletons
 *   npm run sort-skeletons -- data/skeletons/noto-next.json
 *
 * See the order in docs/skeleton-format.md.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"

import type { SkeletonFile } from "../src/core/types"
import { formatSkeletonFile } from "./skeletons/format.ts"

const SKELETONS = "data/skeletons"

const args = process.argv.slice(2)
const paths =
  args.length > 0
    ? args
    : readdirSync(SKELETONS)
        .filter((name) => name.endsWith(".json"))
        .map((name) => `${SKELETONS}/${name}`)

for (const path of paths) {
  const before = readFileSync(path, "utf8")
  const file = JSON.parse(before) as SkeletonFile
  const after = await formatSkeletonFile(path, file)
  if (after !== before) {
    writeFileSync(path, after)
    console.log(`Sorted ${path}`)
  }
}
