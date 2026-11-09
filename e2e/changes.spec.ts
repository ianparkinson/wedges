import { expect, test, type Page } from "@playwright/test"

import { drawSign } from "./drawSign"

const AN = "𒀭"
const GA2 = "𒂷"
const LAGAR = "𒇬"

/** Opens the app, and writes each sign by drawing it and accepting it. */
async function write(page: Page, ...chars: string[]) {
  await page.goto("./")
  const pad = page.getByRole("img", { name: /Drawing pad/ })
  await expect(page.getByText(/Draw a sign/)).toBeVisible()
  for (const char of chars) {
    await drawSign(page, pad, char)
    await page.getByRole("button", { name: "Accept" }).click()
  }
}

for (const order of [
  [AN, GA2],
  [GA2, AN],
]) {
  test(`combines ${order.join(" ")} into |GA₂×AN|`, async ({ page }) => {
    await write(page, ...order)
    await page.getByRole("button", { name: "Combine into |GA₂×AN|" }).click()
    const signs = page.getByRole("region", { name: "Text" }).getByRole("option")
    await expect(signs).toHaveCount(1)
    await expect(signs).toHaveAccessibleName("|GA₂×AN|")
  })
}

test("swaps LAGAR for LAGAR@g, and back", async ({ page }) => {
  await write(page, LAGAR)
  const signs = page.getByRole("region", { name: "Text" }).getByRole("option")

  await page.getByRole("button", { name: "Swap for LAGAR@g" }).click()
  await expect(signs).toHaveAccessibleName("LAGAR@g")

  await page.getByRole("button", { name: "Swap for LAGAR" }).click()
  await expect(signs).toHaveAccessibleName("LAGAR")
})
