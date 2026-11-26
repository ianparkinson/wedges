import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { OslData, SkeletonFile } from "@/core/types"

import { ReviewPage } from "./ReviewPage"

const { file, before, osl } = vi.hoisted(() => {
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
  const before: SkeletonFile = {
    ...file,
    skeletons: [
      { text: "𒁹", shapes: ["w 22 70 270 60 4"] },
      { text: "A", shapes: ["w 10 25 0 50 50"] },
    ],
  }
  return { file, before, osl }
})

vi.mock("./reviewData", async () => {
  const { testFont } = await import("@test/testFont")
  const font = testFont()
  return {
    skeletonFiles: { "noto-next": file },
    useFont: (path: string) => (path ? font : undefined),
    useSkeletonFile: (id: string, ref: string) =>
      ref === "main" ? before : id === "noto-next" ? file : null,
    useOsl: () => osl,
  }
})

describe("ReviewPage", () => {
  beforeEach(() => {
    localStorage.clear()
    history.replaceState(null, "", "/review.html")
  })

  it("shows a tile for each glyph, traced or not, and scores it", async () => {
    render(<ReviewPage />)
    expect(
      await screen.findByRole("button", { name: /^DIŠ, 0\.\d\d$/ }),
    ).toBeVisible()
    expect(
      within(screen.getByRole("list")).getAllByRole("button"),
    ).toHaveLength(2)
    expect(screen.getByText(/^2 glyphs, 2 traced, 0 reviewed/)).toBeVisible()
  })

  it("opens a sign, and moves to the next", async () => {
    render(<ReviewPage />)
    await userEvent.click(screen.getByRole("button", { name: /^DIŠ/ }))
    expect(screen.getByRole("region", { name: "Sign detail" })).toBeVisible()
    expect(location.search).toBe(`?sign=${encodeURIComponent("𒁹#0")}`)

    await userEvent.keyboard("{ArrowRight}")
    expect(location.search).toBe(`?sign=${encodeURIComponent("A#0")}`)
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("region", { name: "Sign detail" })).toBeNull()
  })

  it("hides and shows the glyph and the skeleton with G and S", async () => {
    render(<ReviewPage />)
    await userEvent.click(screen.getByRole("button", { name: /^DIŠ/ }))
    const glyph = screen.getByRole("checkbox", { name: "Glyph (G)" })
    const skeleton = screen.getByRole("checkbox", { name: "Skeleton (S)" })

    await userEvent.keyboard("g")
    expect(glyph).not.toBeChecked()
    await userEvent.keyboard("s")
    expect(skeleton).not.toBeChecked()
    await userEvent.click(glyph)
    await userEvent.keyboard("s")
    expect(glyph).toBeChecked()
    expect(skeleton).toBeChecked()
  })

  it("marks a sign reviewed with R, and moves to the next", async () => {
    render(<ReviewPage />)
    await userEvent.click(screen.getByRole("button", { name: /^DIŠ/ }))
    await userEvent.keyboard("r")
    expect(location.search).toBe(`?sign=${encodeURIComponent("A#0")}`)
    expect(
      screen.getByRole("button", { name: /^DIŠ, .*reviewed$/ }),
    ).toBeVisible()
    expect(screen.getByText(/^2 glyphs, 2 traced, 1 reviewed/)).toBeVisible()
  })

  it("marks every sign shown reviewed, once confirmed", async () => {
    render(<ReviewPage />)
    await userEvent.click(
      screen.getByRole("button", { name: "Mark shown reviewed" }),
    )
    expect(screen.getByText(/^2 glyphs, 2 traced, 0 reviewed/)).toBeVisible()

    await userEvent.click(
      screen.getByRole("button", { name: "Mark 2 signs reviewed" }),
    )
    expect(screen.getByText(/^2 glyphs, 2 traced, 2 reviewed/)).toBeVisible()
  })

  it("unmarks only the signs shown, and can be cancelled", async () => {
    render(<ReviewPage />)
    await userEvent.click(screen.getByRole("button", { name: /^DIŠ/ }))
    await userEvent.keyboard("rr")
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Group" }),
      "unlisted",
    )

    await userEvent.click(
      screen.getByRole("button", { name: "Mark shown unreviewed" }),
    )
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.getByText(/^2 glyphs, 2 traced, 2 reviewed/)).toBeVisible()

    await userEvent.click(
      screen.getByRole("button", { name: "Mark shown unreviewed" }),
    )
    await userEvent.click(
      screen.getByRole("button", { name: "Mark 1 sign unreviewed" }),
    )
    expect(screen.getByText(/^2 glyphs, 2 traced, 1 reviewed/)).toBeVisible()
  })

  it("filters by group", async () => {
    render(<ReviewPage />)
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Group" }),
      "unlisted",
    )
    expect(
      within(screen.getByRole("list")).getByRole("button", { name: /^U\+41/ }),
    ).toBeVisible()
    expect(screen.queryByRole("button", { name: /^DIŠ/ })).toBeNull()
    expect(location.search).toBe("?group=unlisted")
  })

  it("filters by status", async () => {
    render(<ReviewPage />)
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "untraced",
    )
    expect(within(screen.getByRole("list")).queryAllByRole("button")).toEqual(
      [],
    )
    expect(location.search).toBe("?status=untraced")
  })

  it("compares with a file at a git ref, and finds the signs that changed", async () => {
    render(<ReviewPage />)
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Compare with" }),
      "noto-next",
    )
    await userEvent.type(
      screen.getByRole("textbox", { name: "At ref" }),
      "main{Enter}",
    )
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "changed",
    )
    const tile = screen.getByRole("button", { name: /^DIŠ, .*, changed$/ })
    await userEvent.click(tile)
    expect(screen.getByRole("heading", { name: "Before" })).toBeVisible()
    expect(screen.getByText("removed")).toBeVisible()
    expect(screen.getByText("new")).toBeVisible()
  })

  it("compares a file with itself as nothing changed", async () => {
    render(<ReviewPage />)
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Compare with" }),
      "noto-next",
    )
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "changed",
    )
    expect(within(screen.getByRole("list")).queryAllByRole("button")).toEqual(
      [],
    )
  })

  it("links to the app, matching against the open file", () => {
    render(<ReviewPage />)
    expect(
      screen.getByRole("link", { name: "Draw with these skeletons" }),
    ).toHaveAttribute("href", "/?skeletons=noto-next")
  })
})
