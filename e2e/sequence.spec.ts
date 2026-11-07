import { expect, test, type Locator, type Page } from "@playwright/test"

import { drawSign } from "./drawSign"

const AN = "𒀭"
const A = "𒀀"

/**
 * Taps the text just inside the left edge of a sign, or well past its right
 * edge, where the nearest gap between signs is before or after it.
 */
async function tapBeside(page: Page, sign: Locator, side: "left" | "right") {
  await sign.scrollIntoViewIfNeeded()
  const box = await sign.boundingBox()
  if (!box) throw new Error("The sign isn't visible")
  const x = side === "left" ? box.x + 2 : box.x + box.width + 100
  await page.mouse.click(x, box.y + box.height / 2)
}

/** The accessible names of the signs in the text, in order. */
function names(signs: Locator): Promise<(string | null)[]> {
  return signs.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("aria-label")),
  )
}

test("the text is edited at the cursor, and survives a reload", async ({
  page,
}) => {
  await page.goto("./")
  const pad = page.getByRole("img", { name: /Drawing pad/ })
  const text = page.getByRole("region", { name: "Text" })
  const signs = text.getByRole("option")
  const accept = page.getByRole("button", { name: "Accept best" })
  await expect(page.getByText(/Draw a sign/)).toBeVisible()

  await drawSign(page, pad, AN)
  await accept.click()
  await tapBeside(page, signs.first(), "left")
  await drawSign(page, pad, A)
  await accept.click()
  await expect.poll(() => names(signs)).toEqual(["A", "AN"])

  await tapBeside(page, signs.last(), "right")
  await text.getByRole("button", { name: "Backspace" }).click()
  await expect.poll(() => names(signs)).toEqual(["A"])
  await page.reload()
  await expect.poll(() => names(signs)).toEqual(["A"])
})

/**
 * Reads the clipboard by pasting it into a new text box. WebKit lets a page
 * read the clipboard only through a paste, not with `readText()`.
 */
async function pasteClipboard(page: Page): Promise<string> {
  const box = await page.locator("body").evaluateHandle((body) => {
    const textarea = document.createElement("textarea")
    body.append(textarea)
    return textarea
  })
  await box.focus()
  await page.keyboard.press("ControlOrMeta+V")
  return box.inputValue()
}

test("a two-sign text is copied to the clipboard", async ({
  page,
  context,
  browserName,
}) => {
  // Headless Chromium refuses the clipboard unless allowed. WebKit has no
  // such permissions, and allows it.
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
  }
  await page.goto("./")
  const pad = page.getByRole("img", { name: /Drawing pad/ })
  const text = page.getByRole("region", { name: "Text" })
  await expect(page.getByText(/Draw a sign/)).toBeVisible()

  await drawSign(page, pad, AN)
  await page.getByRole("button", { name: "Accept best" }).click()
  await drawSign(page, pad, A)
  await page.getByRole("button", { name: "Accept best" }).click()
  await text.getByRole("button", { name: "Copy" }).click()

  await expect(text.getByRole("status")).toHaveText("Copied")
  expect(await pasteClipboard(page)).toBe(AN + A)
})
