/**
 * The accuracy benchmark: for each skeleton file in data/skeletons, draws
 * every skeleton many times with noise and shuffled stroke order, ranks each
 * drawing against that file's skeletons, and reports how often the right sign
 * comes first and in the top three. Matching only ever uses one file, so the
 * files are never ranked against each other. Run by hand before merging a
 * change to matching or skeletons:
 *
 *   npm run bench:accuracy [-- --noise 0.06 --trials 40]
 *
 * Exits with an error if any file is below the accuracy floors.
 */
import { readdirSync, readFileSync } from "node:fs"
import { basename } from "node:path"
import { parseArgs } from "node:util"

import { prepareDrawing } from "@/core/matcher/match"
import { rank } from "@/core/matcher/rank"
import type { OslData, SkeletonFile } from "@/core/types"

import { signDatabase, skeletonDrawings } from "../test/signDatabase"
import { synthesizeDrawing } from "../test/synthetic/drawings"
import { Random } from "../test/synthetic/random"
import { loadOsl } from "./osl/loadOsl"

const SKELETONS = "data/skeletons"
const TOP1_FLOOR = 0.95
const TOP3_FLOOR = 0.98
const CANDIDATES = 3
const SEED = 1
const SHOWN_CONFUSIONS = 15

const { values } = parseArgs({
  options: {
    noise: { type: "string", default: "0.06" },
    trials: { type: "string", default: "40" },
  },
})
const noise = Number(values.noise)
const trials = Number(values.trials)
const osl = loadOsl()

for (const name of readdirSync(SKELETONS).filter((n) => n.endsWith(".json"))) {
  const id = basename(name, ".json")
  const file = JSON.parse(
    readFileSync(`${SKELETONS}/${name}`, "utf8"),
  ) as SkeletonFile
  if (!benchmark(id, file, osl)) process.exitCode = 1
  console.log()
}

/**
 * Benchmarks one skeleton file and prints its summary, such as
 * "noto: 832 signs × 40 trials …". Returns whether it meets the floors; a
 * file with no skeletons yet has nothing to measure, so it does.
 */
function benchmark(id: string, file: SkeletonFile, osl: OslData): boolean {
  const db = signDatabase(osl, file)
  const skeletons = skeletonDrawings(db, file)
  if (skeletons.length === 0) {
    console.log(`${id}: no skeletons`)
    return true
  }

  const signName = (char: string) => db.sign(char)?.name ?? char
  const random = new Random(SEED)
  const confusions = new Map<string, number>()
  let top1 = 0
  let top3 = 0
  let total = 0
  const started = performance.now()

  for (const { sign, strokes } of skeletons) {
    for (let trial = 0; trial < trials; trial++) {
      const drawing = synthesizeDrawing(strokes, noise, random)
      const results = rank(prepareDrawing(drawing), db.drawable, {
        limit: CANDIDATES,
      })
      const position = results.findIndex((r) => r.sign === sign)

      total++
      if (position === 0) top1++
      else {
        const top = results[0]?.sign.char
        const key = `${signName(sign.char)} → ${top ? signName(top) : "nothing"}`
        confusions.set(key, (confusions.get(key) ?? 0) + 1)
      }
      if (position >= 0) top3++
    }
  }

  const percent = (k: number) => `${((100 * k) / total).toFixed(1)}%`
  const seconds = ((performance.now() - started) / 1000).toFixed(0)
  console.log(
    `${id}: ${skeletons.length} signs × ${trials} trials at noise ${noise}: ` +
      `top-1 ${percent(top1)}, top-3 ${percent(top3)} (${seconds} s)`,
  )
  if (confusions.size > 0) {
    console.log("Commonest confusions (drawn → ranked first):")
  }
  for (const [key, count] of [...confusions]
    .sort((a, b) => b[1] - a[1])
    .slice(0, SHOWN_CONFUSIONS)) {
    console.log(`  ${key}  ×${count}`)
  }

  const passes = top1 / total >= TOP1_FLOOR && top3 / total >= TOP3_FLOOR
  if (!passes) {
    console.error(
      `${id} is below the floors of ${TOP1_FLOOR * 100}% top-1 and ${TOP3_FLOOR * 100}% top-3.`,
    )
  }
  return passes
}
