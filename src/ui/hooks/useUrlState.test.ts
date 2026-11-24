import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { useUrlState } from "./useUrlState"

describe("useUrlState", () => {
  beforeEach(() => history.replaceState(null, "", "/page.html"))

  it("starts from the URL's query", () => {
    history.replaceState(null, "", "/page.html?sort=overlap")
    const { result } = renderHook(() => useUrlState("sort", "file"))
    expect(result.current[0]).toBe("overlap")
  })

  it("falls back to the default", () => {
    const { result } = renderHook(() => useUrlState("sort", "file"))
    expect(result.current[0]).toBe("file")
  })

  it("writes a new value to the URL, and leaves the default out", () => {
    const { result } = renderHook(() => useUrlState("sort", "file"))
    act(() => result.current[1]("overlap"))
    expect(location.search).toBe("?sort=overlap")
    act(() => result.current[1]("file"))
    expect(location.search).toBe("")
  })

  it("reads a value that isn't one of the options as the default", () => {
    history.replaceState(null, "", "/page.html?sort=nonsense")
    const sorts = ["file", "overlap"] as const
    const { result } = renderHook(() => useUrlState("sort", "file", sorts))
    expect(result.current[0]).toBe("file")
  })
})
