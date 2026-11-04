/**
 * Times ranking in headless Chromium, with the CPU throttled to stand in for a
 * phone: npm run bench [-- --throttle 4]. Run by hand alongside the benchmark.
 */
import { parseArgs } from "node:util"

import { chromium } from "playwright-core"
import { build } from "vite"

const STROKE_COUNTS = [1, 5, 10, 20, 30]
const BUDGET_MS = 50
/** Rankings to run first, so the JIT has warmed up before timing. */
const WARM_UP = [1, 10, 30]

const { values } = parseArgs({
  options: { throttle: { type: "string", default: "4" } },
})
const throttle = Number(values.throttle)

const output = await build({
  configFile: false,
  logLevel: "warn",
  resolve: {
    alias: { "@": new URL("../src", import.meta.url).pathname },
  },
  build: {
    write: false,
    lib: {
      entry: new URL("../test/bench/entry.ts", import.meta.url).pathname,
      formats: ["iife"],
      name: "bench",
    },
  },
})
const [result] = Array.isArray(output) ? output : [output]
if (!result || !("output" in result)) throw new Error("Unexpected build output")
const chunk = result.output.find((o) => o.type === "chunk")
if (!chunk) throw new Error("No bundle")

const browser = await chromium.launch()
const page = await browser.newPage()
const cdp = await page.context().newCDPSession(page)
await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle })
await page.addScriptTag({ content: chunk.code })

type Bench = { timeRanking: (counts: number[]) => Record<number, number> }
await page.evaluate(
  (counts) => (window as unknown as { bench: Bench }).bench.timeRanking(counts),
  WARM_UP,
)
const times = await page.evaluate(
  (counts) => (window as unknown as { bench: Bench }).bench.timeRanking(counts),
  STROKE_COUNTS,
)
await browser.close()

console.log(`Median ranking time, CPU throttled ${throttle}×:`)
for (const count of STROKE_COUNTS) {
  const ms = times[count] ?? NaN
  const flag = ms > BUDGET_MS ? `  over the ${BUDGET_MS} ms budget` : ""
  console.log(
    `  ${String(count).padStart(2)} strokes: ${ms.toFixed(1)} ms${flag}`,
  )
}
