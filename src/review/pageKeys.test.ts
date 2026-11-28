import { describe, expect, it } from "vitest"

import { isPageKey } from "./pageKeys"

/** A keydown of `key` dispatched on `target`, as the page would see it. */
function pressOn(target: EventTarget, init: KeyboardEventInit = {}) {
  let event: KeyboardEvent | undefined
  target.addEventListener("keydown", (e) => (event = e as KeyboardEvent))
  target.dispatchEvent(new KeyboardEvent("keydown", { key: "e", ...init }))
  return event!
}

function element(html: string): Element {
  const template = document.createElement("template")
  template.innerHTML = html
  return template.content.firstElementChild!
}

describe("isPageKey", () => {
  it("takes a key pressed on the page or a button", () => {
    expect(isPageKey(pressOn(document.body))).toBe(true)
    expect(isPageKey(pressOn(element("<button>Next</button>")))).toBe(true)
    expect(isPageKey(pressOn(element('<input type="checkbox">')))).toBe(true)
  })

  it("leaves keys typed into a field or list to it", () => {
    expect(isPageKey(pressOn(element("<input>")))).toBe(false)
    expect(isPageKey(pressOn(element("<textarea></textarea>")))).toBe(false)
    expect(isPageKey(pressOn(element("<select></select>")))).toBe(false)
  })

  it("leaves keys held with Ctrl, Cmd or Alt to the browser", () => {
    expect(isPageKey(pressOn(document.body, { ctrlKey: true }))).toBe(false)
    expect(isPageKey(pressOn(document.body, { metaKey: true }))).toBe(false)
    expect(isPageKey(pressOn(document.body, { altKey: true }))).toBe(false)
  })
})
