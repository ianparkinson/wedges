/**
 * The data the review page reads: the skeleton files, their fonts, and the
 * sign names from the Oracc Sign List. Editing a skeleton file updates the
 * page as soon as it's saved. The page's tests mock this module, which only
 * wires Vite's file imports to the page.
 */
import type { Font } from "opentype.js"
import { useEffect, useMemo, useState } from "react"

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

/**
 * The font at `path` in `data/fonts/`, as it is now or, given `ref`, as it
 * was at that git ref: undefined while it loads, and null if it can't. An
 * empty path loads nothing.
 */
export function useFont(path: string, ref = ""): Font | undefined | null {
  const url = !path
    ? ""
    : ref
      ? historyUrl(ref, `data/fonts/${path}`)
      : fontUrls[`/data/fonts/${path}`]!
  const bytes = useFetched(url, (response) => response.arrayBuffer())
  return useMemo(() => (bytes ? readFont(bytes) : bytes), [bytes])
}

/**
 * A skeleton file as it is now or, given `ref`, as it was at that git ref:
 * undefined while it loads, and null if it can't.
 */
export function useSkeletonFile(
  id: string,
  ref = "",
): SkeletonFile | undefined | null {
  const url = id && ref ? historyUrl(ref, `data/skeletons/${id}.json`) : ""
  const old = useFetched(
    url,
    (response) => response.json() as Promise<SkeletonFile>,
  )
  return ref ? old : (skeletonFiles[id] ?? null)
}

/**
 * Where the development server serves a file as it was at a git ref. The
 * path below the site's base is scripts/review/vitePlugin.ts's SHOW_PATH.
 */
function historyUrl(ref: string, path: string): string {
  const query = new URLSearchParams({ ref, path })
  return `${import.meta.env.BASE_URL}@review/show?${query}`
}

/**
 * What `read` makes of the response from `url`: undefined while it loads,
 * and null if it fails.
 */
function useFetched<T>(
  url: string,
  read: (response: Response) => Promise<T>,
): T | undefined | null {
  const [result, setResult] = useState<{ url: string; value: T | null }>()

  useEffect(() => {
    if (!url) return
    let mounted = true
    void fetch(url)
      .then((response) => (response.ok ? read(response) : null))
      .catch(() => null)
      .then((value) => {
        if (mounted) setResult({ url, value })
      })
    return () => {
      mounted = false
    }
    // `read` only says how to read the body, so a new one needn't refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return result?.url === url ? result.value : undefined
}

/** The sign data, or undefined while it loads. */
export function useOsl(): OslData | undefined {
  const [osl, setOsl] = useState<OslData>()

  useEffect(() => {
    void import("virtual:osl").then((module) => setOsl(module.osl))
  }, [])

  return osl
}
