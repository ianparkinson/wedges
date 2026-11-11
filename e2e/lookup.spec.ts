import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("searching sza finds ŠA and its Oracc link", async ({ page }) => {
  await page.goto("./")
  await page.getByRole("button", { name: "Look up" }).click()
  await page.getByRole("searchbox").fill("sza")
  await page.getByRole("button", { name: "About ŠA", exact: true }).click()

  await expect(page.getByRole("dialog", { name: "ŠA" })).toBeVisible()
  await expect(
    page.getByRole("link", { name: "ŠA in the Oracc Sign List" }),
  ).toHaveAttribute("href", "https://oracc.museum.upenn.edu/osl/o0002824")
})

test("tapping a sequence adds each of its signs to the text", async ({
  page,
}) => {
  await page.goto("./")
  await page.getByRole("button", { name: "Look up" }).click()
  await page.getByRole("searchbox").fill("ensi2")
  await page
    .getByRole("grid", { name: "Results" })
    .getByRole("row", { name: "|PA.TE.SI| ensi₂" })
    .click()

  const signs = page.getByRole("region", { name: "Text" }).getByRole("option")
  await expect(signs).toHaveText(["𒉺", "𒋼", "𒋛"])
})

test("Look up has no serious accessibility violations", async ({ page }) => {
  await page.goto("./")
  await page.getByRole("button", { name: "Look up" }).click()
  await page.getByRole("searchbox").fill("sza")
  await expect(page.getByRole("grid", { name: "Results" })).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  )
  expect(serious).toEqual([])
})

test("the keyboard moves through the results, back up to the search, and across to an ⓘ", async ({
  page,
}) => {
  await page.goto("./")
  await page.getByRole("button", { name: "Look up" }).click()
  await page.getByRole("searchbox").fill("sza")
  const rows = page.getByRole("grid", { name: "Results" }).getByRole("row")

  await page.keyboard.press("ArrowDown")
  await expect(rows.first()).toBeFocused()
  await page.keyboard.press("ArrowDown")
  await expect(rows.nth(1)).toBeFocused()
  await page.keyboard.press("ArrowUp")
  await expect(rows.first()).toBeFocused()
  await page.keyboard.press("ArrowUp")
  await expect(page.getByRole("searchbox")).toBeFocused()
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("ArrowRight")
  await expect(
    page.getByRole("button", { name: "About ŠA", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("dialog", { name: "ŠA" })).toBeVisible()
})
