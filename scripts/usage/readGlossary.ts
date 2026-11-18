/**
 * Streams an Oracc glossary out of a project's JSON zip, so that ePSD2's
 * glossary, nearly 2 GB, never has to fit in memory.
 */
import { execFileSync, spawn } from "node:child_process"

import chain from "stream-chain"
import { parser } from "stream-json"
import { pick } from "stream-json/filters/pick.js"
import { streamArray } from "stream-json/streamers/stream-array.js"
import { streamObject } from "stream-json/streamers/stream-object.js"

import type { GlossaryEntry } from "./usageCount.ts"

/** Lists the files in a zip, with `unzip`. */
export function filesInZip(zip: string): string[] {
  return execFileSync("unzip", ["-Z1", zip], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
}

/** Yields the entries of a glossary in a zip, one at a time. */
export async function* glossaryEntries(
  zip: string,
  file: string,
): AsyncGenerator<GlossaryEntry> {
  const items = chain([
    ...parsed(zip, file, "entries"),
    streamArray<GlossaryEntry>(),
  ])
  for await (const { value } of items) yield value
}

/** Yields the instances of a glossary in a zip: references, by spelling key. */
export async function* glossaryInstances(
  zip: string,
  file: string,
): AsyncGenerator<[string, string[]]> {
  const items = chain([
    ...parsed(zip, file, "instances"),
    streamObject<string[]>(),
  ])
  for await (const { key, value } of items) yield [key, value]
}

/**
 * The first stages of a pipeline that parses one top-level property of a
 * JSON file in a zip, read through `unzip -p`. The pipeline fails if the file
 * is cut short.
 */
function parsed(zip: string, file: string, property: string) {
  const unzip = spawn("unzip", ["-p", zip, file], {
    stdio: ["ignore", "pipe", "inherit"],
  })
  return [unzip.stdout, parser(), pick({ filter: property })] as const
}
