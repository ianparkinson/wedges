import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { useReviewed } from "./useReviewed"

const A = ["w 21 73 270 84 20", "w 52 38 270 52 22"]

describe("useReviewed", () => {
  beforeEach(() => localStorage.clear())

  it("marks a sign reviewed with its current shapes", () => {
    const { result } = renderHook(() => useReviewed("noto-next"))
    expect(result.current.isReviewed("𒀀", A)).toBe(false)
    act(() => result.current.setReviewed("𒀀", A, true))
    expect(result.current.isReviewed("𒀀", A)).toBe(true)
  })

  it("clears the mark when a shape changes", () => {
    const { result } = renderHook(() => useReviewed("noto-next"))
    act(() => result.current.setReviewed("𒀀", A, true))
    expect(result.current.isReviewed("𒀀", [A[0]!, "w 52 38 270 50 22"])).toBe(
      false,
    )
  })

  it("can unmark a sign", () => {
    const { result } = renderHook(() => useReviewed("noto-next"))
    act(() => result.current.setReviewed("𒀀", A, true))
    act(() => result.current.setReviewed("𒀀", A, false))
    expect(result.current.isReviewed("𒀀", A)).toBe(false)
  })

  it("keeps each file's marks apart, and across reloads", () => {
    const first = renderHook(() => useReviewed("noto-next"))
    act(() => first.result.current.setReviewed("𒀀", A, true))
    first.unmount()

    expect(
      renderHook(() => useReviewed("noto-next")).result.current.isReviewed(
        "𒀀",
        A,
      ),
    ).toBe(true)
    expect(
      renderHook(() => useReviewed("noto")).result.current.isReviewed("𒀀", A),
    ).toBe(false)
  })
})
