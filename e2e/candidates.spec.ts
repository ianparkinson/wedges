import { expect, test } from "@playwright/test"

import { drawSign } from "./drawSign"

const AN = "𒀭"

test("drawing AN puts AN first, and accepting it adds it to the text", async ({
  page,
}) => {
  await page.goto("./")
  const pad = page.getByRole("img", { name: /Drawing pad/ })
  const candidates = page.getByRole("region", { name: "Candidates" })
  await expect(candidates.getByText(/Draw a sign/)).toBeVisible()

  await drawSign(page, pad, AN)
  await expect(candidates.getByRole("button").first()).toHaveAccessibleName(
    "AN",
  )

  await page.getByRole("button", { name: "Accept" }).click()
  const signs = page.getByRole("listbox", { name: "Signs" }).getByRole("option")
  await expect(signs).toHaveCount(1)
  await expect(signs).toHaveAccessibleName("AN")
  await expect(pad).toHaveAccessibleName("Drawing pad, 0 strokes")
})
