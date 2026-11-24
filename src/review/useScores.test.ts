import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { testFont } from "@test/testFont"

import type { ReviewSign } from "./reviewSigns"
import { useScores } from "./useScores"

const font = testFont()
const style = { tailEnd: 2, taper: 2, legWidth: 0.2 }
const sign = (key: string, text: string, shapes?: string[]): ReviewSign => ({
  key,
  text,
  group: "simple",
  block: "main",
  shapes,
})
const signs = [
  sign("𒁹#0", "𒁹", ["w 22 70 270 70 4"]),
  sign("𒀀#0", "𒀀", ["w 0 0 0 10 4"]),
  sign("𒁺#0", "𒁺"),
]

describe("useScores", () => {
  it("scores each sign with shapes against its glyph, a few at a time", async () => {
    const { result } = renderHook(() => useScores(signs, font, 100, style))
    expect(result.current.pending).toBe(2)
    await waitFor(() => expect(result.current.pending).toBe(0))

    const [traced, noGlyph, untraced] = result.current.signs
    expect(traced?.score?.overlap).toBeGreaterThan(0.6)
    expect(noGlyph?.score).toBeNull()
    expect(untraced).toBe(signs[2])
  })

  it("keeps a sign's score, and the same object, while its shapes stay the same", async () => {
    const { result, rerender } = renderHook(
      ({ signs }) => useScores(signs, font, 100, style),
      { initialProps: { signs } },
    )
    await waitFor(() => expect(result.current.pending).toBe(0))
    const before = result.current.signs

    rerender({ signs: [...signs] })
    expect(result.current.pending).toBe(0)
    expect(result.current.signs[0]).toBe(before[0])
  })
})
