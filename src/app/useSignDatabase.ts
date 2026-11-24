import { useEffect, useState } from "react"

import { SignDatabase } from "@/core/signs"
import type { SkeletonFile } from "@/core/types"

let loading: Promise<SignDatabase> | undefined

/**
 * The sign database, or undefined until it has loaded. The data loads after
 * the first paint, in chunks of its own, so the pad appears at once. It loads
 * only once, however many components ask.
 */
export function useSignDatabase(): SignDatabase | undefined {
  const [database, setDatabase] = useState<SignDatabase>()

  useEffect(() => {
    let mounted = true
    loading ??= loadSignDatabase()
    void loading.then((db) => {
      if (mounted) setDatabase(db)
    })
    return () => {
      mounted = false
    }
  }, [])

  return database
}

async function loadSignDatabase(): Promise<SignDatabase> {
  const [{ osl }, { usage }, skeletons] = await Promise.all([
    import("virtual:osl"),
    import("virtual:usage"),
    loadSkeletons(),
  ])
  return new SignDatabase([skeletons], osl, usage)
}

/**
 * The skeletons to match against: noto.json or, in development, the file
 * the URL names, as in `?skeletons=noto-next`, to try out new skeletons.
 */
async function loadSkeletons(): Promise<SkeletonFile> {
  const id = new URLSearchParams(location.search).get("skeletons")
  if (import.meta.env.DEV && id) {
    const files = import.meta.glob<SkeletonFile>(
      "../../data/skeletons/*.json",
      { import: "default" },
    )
    const load = files[`../../data/skeletons/${id}.json`]
    if (load) return load()
  }

  const { default: noto } = await import("../../data/skeletons/noto.json")
  return noto as SkeletonFile
}
