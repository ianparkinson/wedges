import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => {
  cleanup()
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
