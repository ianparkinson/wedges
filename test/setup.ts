import "@testing-library/jest-dom/vitest"

import { Canvas, Path2D } from "@napi-rs/canvas"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => {
  cleanup()
  sessionStorage.clear()
})

// jsdom implements neither canvas drawing, pointer capture, ResizeObserver
// nor matchMedia. Components that use them get a context-less canvas, capture
// that does nothing, and an observer and media queries that never fire.
HTMLCanvasElement.prototype.getContext = () => null
Element.prototype.setPointerCapture = () => {}
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.matchMedia = (query) =>
  ({
    media: query,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }) as unknown as MediaQueryList

// Node has no OffscreenCanvas or Path2D, which the redraw check draws with,
// so tests use @napi-rs/canvas, the same canvas API on Skia.
globalThis.OffscreenCanvas ??= Canvas as unknown as typeof OffscreenCanvas
globalThis.Path2D ??= Path2D as unknown as typeof globalThis.Path2D
