import { describe, expect, it } from "vitest"

import { isAllowed } from "./gitShow.ts"

describe("isAllowed", () => {
  it("allows skeleton files and fonts at ordinary refs", () => {
    expect(isAllowed("main", "data/skeletons/noto-next.json")).toBe(true)
    expect(isAllowed("HEAD~2", "data/skeletons/noto.json")).toBe(true)
    expect(
      isAllowed("a4ef0a7", "data/fonts/noto/NotoSansCuneiform-Regular.ttf"),
    ).toBe(true)
  })

  it("refuses other files", () => {
    expect(isAllowed("main", "package.json")).toBe(false)
    expect(isAllowed("main", "data/skeletons/../../.env")).toBe(false)
    expect(isAllowed("main", "data/fonts/noto/OFL.txt")).toBe(false)
  })

  it("refuses refs git could read as options or paths", () => {
    expect(isAllowed("--output=x", "data/skeletons/noto.json")).toBe(false)
    expect(isAllowed("main:x", "data/skeletons/noto.json")).toBe(false)
    expect(isAllowed("main x", "data/skeletons/noto.json")).toBe(false)
  })
})
