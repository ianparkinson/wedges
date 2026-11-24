import type { Font } from "opentype.js"
import { useMemo } from "react"

import type { OslData } from "@/core/types"

import { changedGlyphs, compareSigns } from "./compare"
import { skeletonFonts } from "./redraw/fonts"
import type { StrokeStyle } from "./redraw/impression"
import { useFont, useSkeletonFile } from "./reviewData"
import { reviewSigns, type ReviewSign } from "./reviewSigns"

/** The version a page compares with: its font and how to draw its shapes. */
export interface ComparedWith {
  readonly font: Font
  readonly winkelhakenAngle: number
  readonly style: StrokeStyle
}

/** The signs to show, each with how it was before when comparing. */
export interface Comparison {
  readonly signs: readonly ReviewSign[]
  /** The version compared with, once it has loaded. */
  readonly comparedWith?: ComparedWith
  /** Why there's nothing to compare with yet, or why there can't be. */
  readonly status?: string
}

/**
 * Compares `signs`, the current version of a file over `font`, which is
 * `fontPath` in `data/fonts/`, with skeleton
 * file `compareId` at git ref `ref`, or as it is now when `ref` is empty. Its
 * font is read from the same ref. An empty `compareId` compares nothing.
 */
export function useComparison(
  signs: readonly ReviewSign[],
  font: Font,
  fontPath: string,
  osl: OslData,
  compareId: string,
  ref: string,
): Comparison {
  const target = compareId ? skeletonFonts[compareId] : undefined
  const file = useSkeletonFile(compareId, ref)
  const otherFont =
    target && (ref || target.path !== fontPath) ? target.path : ""
  const fetchedFont = useFont(otherFont, ref)
  const beforeFont = otherFont ? fetchedFont : font

  const compared = useMemo(() => {
    if (!target || !file || !beforeFont) return undefined
    const beforeSigns = reviewSigns(file, beforeFont, osl)
    return {
      signs: compareSigns(signs, beforeSigns, changedGlyphs(beforeFont, font)),
      comparedWith: {
        font: beforeFont,
        winkelhakenAngle: file.winkelhakenAngle,
        style: target.style,
      },
    }
  }, [signs, font, osl, target, file, beforeFont])

  if (!compareId) return { signs }
  if (!target) return { signs, status: `No font for ${compareId}.` }
  if (file === null || fetchedFont === null) {
    return { signs, status: `Can't read ${compareId} at ${ref || "now"}.` }
  }
  return compared ?? { signs, status: "Loading the version to compare with…" }
}
