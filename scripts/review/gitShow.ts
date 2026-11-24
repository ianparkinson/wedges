/**
 * Reads a data file as it was at a git ref, for the review page's compare.
 */
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const run = promisify(execFile)

/** The data files the review page may read from history. */
const ALLOWED_PATH =
  /^data\/(skeletons\/[\w-]+\.json|fonts\/[\w-]+\/[\w.-]+\.ttf)$/

/**
 * Characters a ref can use, such as main, HEAD~2, v1.0 or a commit hash. A
 * ref can't start with "-", so git can't read it as an option.
 */
const ALLOWED_REF = /^[\w][\w./~^@{}-]*$/

/** Largest file the page reads: fonts are about 1 MB. */
const MAX_BYTES = 20 * 1024 * 1024

/** Whether the review page may ask for `path` at `ref`. */
export function isAllowed(ref: string, path: string): boolean {
  return (
    ALLOWED_REF.test(ref) && ALLOWED_PATH.test(path) && !path.includes("..")
  )
}

/** The file at `path` as it was at `ref`. Throws if git can't find it. */
export async function gitShow(ref: string, path: string): Promise<Buffer> {
  const { stdout } = await run("git", ["show", `${ref}:${path}`], {
    encoding: "buffer",
    maxBuffer: MAX_BYTES,
  })
  return stdout
}
