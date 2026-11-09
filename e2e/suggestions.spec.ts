import { expect, test } from "@playwright/test"

import { drawSign } from "./drawSign"

const PA = "𒉺"
const TE = "𒋼"
const SI = "𒋛"
const SI_GUNU = "𒋜"

test("drawing PA, TE and SI offers the reading ensi₂, and opens its entry", async ({
  page,
}) => {
  await page.goto("./")
  const pad = page.getByRole("img", { name: /Drawing pad/ })
  await expect(page.getByText(/Draw a sign/)).toBeVisible()
  for (const char of [PA, TE, SI]) {
    await drawSign(page, pad, char)
    await page.getByRole("button", { name: "Accept" }).click()
  }

  const suggestions = page.getByRole("group", { name: "Suggestions" })
  await expect(suggestions.getByRole("button")).toHaveText([
    /^SI /,
    "|PA.TE.SI| ensag, ensi₂, ensik",
    SI + SI_GUNU,
  ])

  await suggestions.getByRole("button", { name: /ensi₂/ }).click()
  await expect(page.getByRole("dialog", { name: "|PA.TE.SI|" })).toBeVisible()
  await expect(
    page.getByRole("link", { name: "|PA.TE.SI| in the Oracc Sign List" }),
  ).toBeVisible()
})
