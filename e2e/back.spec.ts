import { expect, test } from "@playwright/test"

import { drawSign } from "./drawSign"

const AN = "𒀭"

test("back closes a candidate's info and keeps the drawing", async ({
  page,
}) => {
  await page.goto("./")
  const pad = page.getByRole("img", { name: /Drawing pad/ })
  await drawSign(page, pad, AN)
  await page.getByRole("button", { name: "About AN" }).click()
  await expect(page.getByRole("dialog", { name: "AN" })).toBeVisible()

  await page.goBack()
  await expect(page.getByRole("dialog")).toBeHidden()
  await expect(page.getByRole("button", { name: "About AN" })).toBeVisible()
})

test("back from a Look up entry closes Look up", async ({ page }) => {
  await page.goto("./")
  await page.getByRole("button", { name: "Look up" }).click()
  await page.getByRole("searchbox").fill("sza")
  await page.getByRole("button", { name: "About ŠA", exact: true }).click()
  await expect(page.getByRole("dialog", { name: "ŠA" })).toBeVisible()

  await page.goBack()
  await expect(page.getByRole("dialog")).toBeHidden()
  await expect(page.getByRole("button", { name: "Look up" })).toBeVisible()
})

test("closing a sheet takes its history entry away", async ({ page }) => {
  await page.goto("./")
  await page.getByRole("button", { name: "Look up" }).click()
  await expect
    .poll(() => page.evaluate(() => history.state as unknown))
    .not.toBeNull()
  await page.getByRole("button", { name: "Close" }).click()

  await expect(page.getByRole("dialog")).toBeHidden()
  await expect
    .poll(() => page.evaluate(() => history.state as unknown))
    .toBeNull()
})
