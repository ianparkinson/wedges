import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("the app loads with an empty drawing pad", async ({ page }) => {
  await page.goto("./")
  await expect(page).toHaveTitle("Wedges")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Wedges")
  await expect(
    page.getByRole("img", { name: "Drawing pad, 0 strokes" }),
  ).toBeVisible()
})

test("the page's icons are served", async ({ page, request }) => {
  await page.goto("./")
  const icons = page.locator('link[rel="icon"], link[rel="apple-touch-icon"]')
  await expect(icons).toHaveCount(2)
  for (const href of await icons.evaluateAll((links) =>
    links.map((link) => (link as HTMLLinkElement).href),
  )) {
    expect((await request.get(href)).ok(), href).toBe(true)
  }
})

test("the app has no serious accessibility violations", async ({ page }) => {
  await page.goto("./")
  const results = await new AxeBuilder({ page }).analyze()
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  )
  expect(serious).toEqual([])
})
