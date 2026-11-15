import { afterEach, describe, expect, it } from "vitest"

import { countVisit } from "./analytics"

function goatCounterScript() {
  return document.head.querySelector("script[data-goatcounter]")
}

describe("countVisit", () => {
  afterEach(() => {
    goatCounterScript()?.remove()
  })

  it("loads GoatCounter's script on the deployed site", () => {
    countVisit("ianparkinson.github.io")
    expect(goatCounterScript()).toHaveAttribute(
      "src",
      "https://gc.zgo.at/count.js",
    )
    expect(goatCounterScript()).toHaveAttribute(
      "data-goatcounter",
      "https://wedges.goatcounter.com/count",
    )
  })

  it("counts nothing on a dev server, preview or e2e test", () => {
    countVisit("localhost")
    expect(goatCounterScript()).toBeNull()
  })

  it("counts nothing on a fork deployed to its own GitHub Pages", () => {
    countVisit("someone-else.github.io")
    expect(goatCounterScript()).toBeNull()
  })
})
