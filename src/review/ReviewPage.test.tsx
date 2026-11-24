import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { OslData, SkeletonFile } from "@/core/types"

import { ReviewPage } from "./ReviewPage"

const { file, osl } = vi.hoisted(() => {
  const file: SkeletonFile = {
    version: 2,
    font: { family: "Test", version: "1", unitsPerEm: 1000, sha256: "" },
    wedges: "tapered",
    headLean: 0,
    winkelhakenAngle: 100,
    skeletons: [
      { text: "𒁹", shapes: ["w 22 70 270 70 4"] },
      { text: "A", shapes: ["w 10 25 0 50 50"] },
    ],
  }
  const osl: OslData = {
    signs: [{ char: "𒁹", name: "DIŠ", oslId: "1", values: ["diš"] }],
    sequences: [],
  }
  return { file, osl }
})

vi.mock("./reviewData", async () => {
  const { testFont } = await import("@test/testFont")
  const font = testFont()
  return {
    skeletonFiles: { "noto-next": file },
    useFont: () => font,
    useOsl: () => osl,
  }
})

describe("ReviewPage", () => {
  beforeEach(() => {
    history.replaceState(null, "", "/review.html")
  })

  it("shows a tile for each glyph, traced or not, and scores it", async () => {
    render(<ReviewPage />)
    expect(
      await screen.findByRole("figure", { name: /^DIŠ, 0\.\d\d$/ }),
    ).toBeVisible()
    expect(
      within(screen.getByRole("list")).getAllByRole("figure"),
    ).toHaveLength(2)
    expect(screen.getByText(/^2 glyphs, 2 traced/)).toBeVisible()
  })

  it("filters by group", async () => {
    render(<ReviewPage />)
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Group" }),
      "unlisted",
    )
    expect(
      within(screen.getByRole("list")).getByRole("figure", { name: /^U\+41/ }),
    ).toBeVisible()
    expect(screen.queryByRole("figure", { name: /^DIŠ/ })).toBeNull()
    expect(location.search).toBe("?group=unlisted")
  })

  it("filters by status", async () => {
    render(<ReviewPage />)
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "untraced",
    )
    expect(within(screen.getByRole("list")).queryAllByRole("figure")).toEqual(
      [],
    )
    expect(location.search).toBe("?status=untraced")
  })
})
