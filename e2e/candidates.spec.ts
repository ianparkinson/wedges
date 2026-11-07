import { expect, test } from "@playwright/test"

import { drawSign } from "./drawSign"

const AN = "𒀭"

test("drawing AN puts AN first, and accepting it adds it to the picked signs", async ({
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

  await candidates.getByRole("button", { name: "Accept best" }).click()
  await expect(page.getByRole("status", { name: "Picked signs" })).toHaveText(
    AN,
  )
  await expect(pad).toHaveAccessibleName("Drawing pad, 0 strokes")
})
