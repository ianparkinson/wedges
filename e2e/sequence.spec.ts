import { expect, test, type Locator, type Page } from "@playwright/test"

import { drawSign } from "./drawSign"

const AN = "𒀭"
const A = "𒀀"

/** Opens the app, and gives the text's signs and a way to write a sign. */
async function openApp(page: Page) {
  await page.goto("./")
  const pad = page.getByRole("img", { name: /Drawing pad/ })
  const text = page.getByRole("region", { name: "Text" })
  await expect(page.getByText(/Draw a sign/)).toBeVisible()

  const write = async (char: string) => {
    await drawSign(page, pad, char)
    await page.getByRole("button", { name: "Accept best" }).click()
  }
  return { text, signs: text.getByRole("option"), write }
}

/**
 * Taps the text just inside the left edge of a sign, where the nearest gap
 * between signs is the one before it. The page is scrolled to the sign
 * first, since a tap by position doesn't scroll.
 */
async function tapBefore(page: Page, sign: Locator) {
  await sign.scrollIntoViewIfNeeded()
  const box = await sign.boundingBox()
  if (!box) throw new Error("The sign isn't visible")
  await page.mouse.click(box.x + 2, box.y + box.height / 2)
}

/** The accessible names of the signs in the text, in order. */
function names(signs: Locator): Promise<(string | null)[]> {
  return signs.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("aria-label")),
  )
}

test("a sign is written where the text was tapped", async ({ page }) => {
  const { signs, write } = await openApp(page)
  await write(AN)

  await tapBefore(page, signs.first())
  await write(A)
  await expect.poll(() => names(signs)).toEqual(["A", "AN"])
})

test("Backspace deletes the sign before the cursor", async ({ page }) => {
  const { text, signs, write } = await openApp(page)
  await write(AN)
  await write(A)

  await tapBefore(page, signs.last())
  await text.getByRole("button", { name: "Backspace" }).click()
  await expect.poll(() => names(signs)).toEqual(["A"])
})

test("the text survives a reload", async ({ page }) => {
  const { signs, write } = await openApp(page)
  await write(AN)

  await page.reload()
  await expect.poll(() => names(signs)).toEqual(["AN"])
})
