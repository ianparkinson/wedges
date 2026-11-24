import type { Font } from "opentype.js"
import { memo, useMemo } from "react"

import { codePoints } from "@/core/cuneiform"

import { isChanged } from "./compare"
import type { StrokeStyle } from "./redraw/impression"
import type { RedrawLimits } from "./redraw/limits"
import type { ReviewSign } from "./reviewSigns"
import styles from "./SignTile.module.css"
import { SkeletonPicture, type PictureBefore } from "./SkeletonPicture"
import type { ComparedWith } from "./useComparison"

/** Props for {@link SignTile}. */
export interface SignTileProps {
  sign: ReviewSign
  font: Font
  winkelhakenAngle: number
  style: StrokeStyle
  /** The file's limits, which pick out shapes too far off the ink. */
  limits?: RedrawLimits
  /** The version compared with, whose glyph and shapes are drawn dashed where they differ. */
  comparedWith?: ComparedWith
  isReviewed: boolean
  isSelected: boolean
  /** Opens the sign, by its key. */
  onSelect: (key: string) => void
}

/**
 * A glyph with its skeleton drawn over it, its name, and its overlap score,
 * as a button that opens the sign in detail. It draws again only when its
 * props change, since the page has hundreds.
 */
export const SignTile = memo(function SignTile({
  sign,
  font,
  winkelhakenAngle,
  style,
  limits,
  comparedWith,
  isReviewed,
  isSelected,
  onSelect,
}: SignTileProps) {
  const changed = isChanged(sign)
  const before = useMemo<PictureBefore | undefined>(
    () =>
      comparedWith && sign.before && changed
        ? {
            shapes: sign.before.shapes ?? [],
            winkelhakenAngle: comparedWith.winkelhakenAngle,
            style: comparedWith.style,
            font: sign.before.glyphChanged ? comparedWith.font : undefined,
          }
        : undefined,
    [comparedWith, sign.before, changed],
  )
  const astray = useMemo(
    () =>
      limits && sign.score?.shapesOutside.map((o) => o > limits.shapeOutside),
    [limits, sign.score],
  )

  const name = sign.name ?? codePoints(sign.text)
  const status = sign.score
    ? sign.score.overlap.toFixed(2)
    : sign.shapes
      ? sign.score === null
        ? "no glyph"
        : "scoring…"
      : "no skeleton"

  return (
    <button
      type="button"
      className={styles.tile}
      aria-label={[
        name,
        status,
        ...(changed ? ["changed"] : []),
        ...(isReviewed ? ["reviewed"] : []),
      ].join(", ")}
      aria-pressed={isSelected}
      onClick={() => onSelect(sign.key)}
    >
      <SkeletonPicture
        text={sign.text}
        shapes={sign.shapes}
        font={font}
        winkelhakenAngle={winkelhakenAngle}
        style={style}
        astray={astray}
        before={before}
      />
      <span className={styles.name}>{name}</span>
      <span className={styles.score}>
        {status}
        {changed && <span className={styles.changed}> changed</span>}
        {isReviewed && <span className={styles.reviewed}> ✓</span>}
      </span>
    </button>
  )
})
