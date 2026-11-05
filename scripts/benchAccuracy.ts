/**
 * The accuracy benchmark: draws every skeleton many times with noise and
 * shuffled stroke order, ranks each drawing, and reports how often the right
 * sign comes first and in the top three. Run by hand before merging a change
 * to matching or skeletons:
 *
 *   npm run bench:accuracy [-- --noise 0.6 --trials 40]
 *
 * Exits with an error below the accuracy floors.
 */
import { parseArgs } from "node:util"

import { rank } from "@/core/matcher/rank"

import { signDatabase, skeletonDrawings } from "../test/signDatabase"
import { synthesizeDrawing } from "../test/synthetic/drawings"
import { Random } from "../test/synthetic/random"
import { loadOsl } from "./osl/loadOsl"

const TOP1_FLOOR = 0.95
const TOP3_FLOOR = 0.98
const CANDIDATES = 3
const SEED = 1
const SHOWN_CONFUSIONS = 15

const { values } = parseArgs({
  options: {
    noise: { type: "string", default: "0.6" },
    trials: { type: "string", default: "40" },
  },
})
const noise = Number(values.noise)
const trials = Number(values.trials)

const db = signDatabase(loadOsl())
const skeletons = skeletonDrawings(db)
const name = (char: string) => db.sign(char)?.name ?? char
const random = new Random(SEED)
const confusions = new Map<string, number>()
let top1 = 0
let top3 = 0
let total = 0
const started = performance.now()

for (const { sign, strokes } of skeletons) {
  for (let trial = 0; trial < trials; trial++) {
    const drawing = synthesizeDrawing(strokes, noise, random)
    const results = rank(drawing, db.drawable, { limit: CANDIDATES })
    const position = results.findIndex((r) => r.sign === sign)
    total++
    if (position === 0) top1++
    else {
      const top = results[0]?.sign.char
      const key = `${name(sign.char)} → ${top ? name(top) : "nothing"}`
      confusions.set(key, (confusions.get(key) ?? 0) + 1)
    }
    if (position >= 0) top3++
  }
}

const percent = (k: number) => `${((100 * k) / total).toFixed(1)}%`
const seconds = ((performance.now() - started) / 1000).toFixed(0)
console.log(
  `${skeletons.length} signs × ${trials} trials at noise ${noise}: ` +
    `top-1 ${percent(top1)}, top-3 ${percent(top3)} (${seconds} s)`,
)
console.log("Commonest confusions (drawn → ranked first):")
for (const [key, count] of [...confusions]
  .sort((a, b) => b[1] - a[1])
  .slice(0, SHOWN_CONFUSIONS)) {
  console.log(`  ${key}  ×${count}`)
}
if (top1 / total < TOP1_FLOOR || top3 / total < TOP3_FLOOR) {
  console.error(
    `Below the floors of ${TOP1_FLOOR * 100}% top-1 and ${TOP3_FLOOR * 100}% top-3.`,
  )
  process.exitCode = 1
}
