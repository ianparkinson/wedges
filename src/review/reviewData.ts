/**
 * The data the review page reads: the skeleton files, their fonts, and the
 * sign names from the Oracc Sign List. Editing a skeleton file updates the
 * page as soon as it's saved. The page's tests mock this module, which only
 * wires Vite's file imports to the page.
 */
import type { Font } from "opentype.js"
import { useEffect, useState } from "react"

import type { OslData, SkeletonFile } from "@/core/types"

import { readFont } from "./redraw/glyphs"

const files = import.meta.glob<SkeletonFile>("/data/skeletons/*.json", {
  eager: true,
  import: "default",
})

const fontUrls = import.meta.glob<string>("/data/fonts/**/*.ttf", {
  eager: true,
  query: "?url",
  import: "default",
})

/** Each skeleton file in `data/skeletons/`, by its name. */
export const skeletonFiles: Readonly<Record<string, SkeletonFile>> =
  Object.fromEntries(
    Object.entries(files).map(([path, file]) => [
      path.replace(/^.*\/(.*)\.json$/, "$1"),
      file,
    ]),
  )

/** The font at `path` in `data/fonts/`, or undefined while it loads. */
export function useFont(path: string): Font | undefined {
  const [font, setFont] = useState<{ path: string; font: Font }>()

  useEffect(() => {
    let mounted = true
    void fetch(fontUrls[`/data/fonts/${path}`]!)
      .then((response) => response.arrayBuffer())
      .then((bytes) => {
        if (mounted) setFont({ path, font: readFont(bytes) })
      })
    return () => {
      mounted = false
    }
  }, [path])

  return font?.path === path ? font.font : undefined
}

/** The sign data, or undefined while it loads. */
export function useOsl(): OslData | undefined {
  const [osl, setOsl] = useState<OslData>()

  useEffect(() => {
    void import("virtual:osl").then((module) => setOsl(module.osl))
  }, [])

  return osl
}
