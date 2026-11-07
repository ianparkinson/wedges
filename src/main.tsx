import "modern-normalize/modern-normalize.css"
import "@fontsource/noto-sans-cuneiform/cuneiform-400.css"
import "./app/tokens.css"
import "./app/global.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "@/app/App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
