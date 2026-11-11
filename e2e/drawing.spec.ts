import { expect, test } from "@playwright/test"

import { drawSign } from "./drawSign"

/** AN, four wedges: a vertical, a horizontal and two diagonals. */
const AN = "𒀭"

test("each stroke drawn on the pad stays there until undone or cleared", async ({
  page,
}) => {
  await page.goto("./")
  const pad = page.getByRole("img", { name: /Drawing pad/ })

  await drawSign(page, pad, AN)
  await expect(pad).toHaveAccessibleName("Drawing pad, 4 strokes")

  await page.getByRole("button", { name: "Undo" }).click()
  await expect(pad).toHaveAccessibleName("Drawing pad, 3 strokes")

  await page.getByRole("button", { name: "Clear", exact: true }).click()
  await expect(pad).toHaveAccessibleName("Drawing pad, 0 strokes")
})
