import "modern-normalize/modern-normalize.css"
import "./app/fonts.css"
import "./app/tokens.css"
import "./app/global.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { countVisit } from "@/app/analytics"
import { App } from "@/app/App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

countVisit(location.hostname)
