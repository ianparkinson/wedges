import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useShapesDraft } from "./useShapesDraft"

const a = "w 10 50 0 30 12"
const b = "w 12 50 0 30 12"
const c = "w 14 50 0 30 12"

describe("useShapesDraft", () => {
  it("starts from the shapes, one to a line", () => {
    const { result } = renderHook(() => useShapesDraft([a, b]))
    expect(result.current.text).toBe(`${a}\n${b}`)
    expect(result.current.shapes).toEqual([a, b])
    expect(result.current.canUndo).toBe(false)
  })

  it("undoes and redoes each change", () => {
    const { result } = renderHook(() => useShapesDraft([a]))
    act(() => result.current.setShapes([b]))
    act(() => result.current.setText(c))
    act(() => result.current.undo())
    expect(result.current.text).toBe(b)
    act(() => result.current.undo())
    expect(result.current.text).toBe(a)
    expect(result.current.canUndo).toBe(false)
    act(() => result.current.redo())
    expect(result.current.text).toBe(b)
  })

  it("undoes a drag's continuing changes in one step", () => {
    const { result } = renderHook(() => useShapesDraft([a]))
    act(() => result.current.setShapes([b]))
    act(() => result.current.setShapes([c], true))
    act(() => result.current.undo())
    expect(result.current.text).toBe(a)
  })

  it("forgets what was undone after a new change", () => {
    const { result } = renderHook(() => useShapesDraft([a]))
    act(() => result.current.setShapes([b]))
    act(() => result.current.undo())
    act(() => result.current.setShapes([c]))
    expect(result.current.canRedo).toBe(false)
  })
})
