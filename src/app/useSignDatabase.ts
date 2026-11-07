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
  const [{ osl }, { default: noto }] = await Promise.all([
    import("virtual:osl"),
    import("../../data/skeletons/noto.json"),
  ])
  return new SignDatabase([noto as SkeletonFile], osl)
}
