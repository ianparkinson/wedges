import "modern-normalize/modern-normalize.css"
import "@/app/fonts.css"
import "@/app/tokens.css"
import "@/app/global.css"
import "./tokens.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { ReviewPage } from "./ReviewPage"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReviewPage />
  </StrictMode>,
)
