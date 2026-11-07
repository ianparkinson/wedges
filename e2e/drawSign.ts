import type { Locator, Page } from "@playwright/test"

import noto from "../data/skeletons/noto.json" with { type: "json" }
import type { Point } from "../src/core/geometry"
import { parseSpec } from "../src/core/spec"
import type { Stroke } from "../src/core/strokes"

/** Skeletons span 0 to 10 in each direction. */
const SKELETON_SIZE = 10

/** The sign is drawn inside this fraction of the pad, centred. */
const DRAWING_FRACTION = 0.8

/** Mouse moves per leg of a stroke, so that the pad sees a trace, not a jump. */
const STEPS = 12

/**
 * Draws a sign's Noto skeleton on the pad, stroke by stroke, as a person
 * would: each wedge from head to tail, and each Winkelhaken from one leg's end
 * round the vertex to the other's. Playwright can only tap a touchscreen, so
 * the strokes are drawn with the mouse, which the pad handles in the same way.
 */
export async function drawSign(page: Page, pad: Locator, char: string) {
  const skeleton = noto.skeletons.find((s) => s.char === char)
  if (!skeleton) throw new Error(`No Noto skeleton for ${char}`)

  const box = await pad.boundingBox()
  if (!box) throw new Error("The drawing pad isn't visible")
  const scale =
    (DRAWING_FRACTION * Math.min(box.width, box.height)) / SKELETON_SIZE
  const toPage = ({ x, y }: Point) => ({
    x: box.x + box.width / 2 + (x - SKELETON_SIZE / 2) * scale,
    y: box.y + box.height / 2 + (y - SKELETON_SIZE / 2) * scale,
  })

  for (const stroke of parseSpec(skeleton.spec)) {
    await drawPath(page, strokePath(stroke).map(toPage))
  }
}

/** The path a finger takes to draw a stroke. */
function strokePath(stroke: Stroke): Point[] {
  switch (stroke.kind) {
    case "wedge":
      return [stroke.head, stroke.tail]
    case "winkelhaken":
      return [stroke.legA, stroke.vertex, stroke.legB]
  }
}

async function drawPath(page: Page, [start, ...rest]: Point[]) {
  await page.mouse.move(start!.x, start!.y)
  await page.mouse.down()
  for (const point of rest) {
    await page.mouse.move(point.x, point.y, { steps: STEPS })
  }
  await page.mouse.up()
}
