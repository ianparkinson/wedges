import "modern-normalize/modern-normalize.css"
import "@fontsource/noto-sans-cuneiform/cuneiform-400.css"
import "./app/tokens.css"
import "./app/global.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "@/app/App"

// The page has no other cuneiform font to fall back on, so signs drawn
// before Noto has loaded show as boxes. Wait for it before the first
// render, but no longer than a browser would hide text for a font anyway.
const FONT_WAIT_MS = 3000

function render() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

const timeout = new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS))
Promise.race([document.fonts.load('1em "Noto Sans Cuneiform"', "𒀭"), timeout])
  .catch(() => {})
  .finally(render)
