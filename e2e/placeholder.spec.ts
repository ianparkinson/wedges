import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('the placeholder page loads', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveTitle('Wedges')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wedges')
})

test('the placeholder page has no serious accessibility violations', async ({
  page,
}) => {
  await page.goto('./')
  const results = await new AxeBuilder({ page }).analyze()
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  expect(serious).toEqual([])
})
