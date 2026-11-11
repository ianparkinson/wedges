import { expect, test, type Locator, type Page } from "@playwright/test"

import { drawSign } from "./drawSign"

const AN = "𒀭"

/** True if the whole of the element is inside the viewport, without scrolling. */
async function isFullyInView(page: Page, element: Locator): Promise<boolean> {
  const box = await element.boundingBox()
  const viewport = page.viewportSize()
  if (!box || !viewport) return false
  return (
    box.x >= 0 &&
    box.y >= 0 &&
    box.x + box.width <= viewport.width &&
    box.y + box.height <= viewport.height
  )
}

test("the text, suggestions, pad and candidates all fit on the screen", async ({
  page,
}) => {
  await page.goto("./")
  const pad = page.getByRole("img", { name: /Drawing pad/ })
  await expect(page.getByText(/Draw a sign/)).toBeVisible()
  await drawSign(page, pad, AN)
  await page.getByRole("button", { name: "Accept" }).click()
  await drawSign(page, pad, AN)

  const candidates = page.getByRole("region", { name: "Candidates" })
  await expect(candidates.getByRole("row")).toHaveCount(3)
  for (const part of [
    page.getByRole("region", { name: "Text" }),
    page.getByRole("group", { name: "Suggestions" }),
    pad,
    page.getByRole("button", { name: "Accept" }),
    candidates,
  ]) {
    expect(await isFullyInView(page, part)).toBe(true)
  }
})

test("nothing sticks out sideways on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto("./")
  const pad = page.getByRole("img", { name: /Drawing pad/ })
  await expect(page.getByText(/Draw a sign/)).toBeVisible()
  await drawSign(page, pad, AN)

  // Accept is at its widest when it shows a candidate.
  await expect(page.getByRole("button", { name: "Accept" })).toBeEnabled()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBe(0)
})

test("the pad stops growing on a very tall screen", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 1600 })
  await page.goto("./")
  const pad = await page.getByRole("img", { name: /Drawing pad/ }).boundingBox()
  expect(pad?.height).toBeLessThanOrEqual(480)
})

test("the pad fills the width", async ({ page }) => {
  await page.goto("./")
  const pad = await page.getByRole("img", { name: /Drawing pad/ }).boundingBox()
  const text = await page.getByRole("region", { name: "Text" }).boundingBox()
  expect(pad?.width).toBeCloseTo(text?.width ?? 0, 0)
})

// Chrome on Android briefly makes the viewport taller when a tab comes back
// from the tab overview.
test("the pad shrinks back when the screen grows and shrinks again", async ({
  page,
}) => {
  await page.setViewportSize({ width: 412, height: 770 })
  await page.goto("./")
  const pad = page.getByRole("img", { name: /Drawing pad/ })
  await expect(page.getByText(/Draw a sign/)).toBeVisible()
  const before = (await pad.boundingBox())?.height

  await page.setViewportSize({ width: 412, height: 794 })
  await expect
    .poll(async () => (await pad.boundingBox())?.height)
    .toBe((before ?? 0) + 24)
  await page.setViewportSize({ width: 412, height: 770 })
  await expect.poll(async () => (await pad.boundingBox())?.height).toBe(before)
})
