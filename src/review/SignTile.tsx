import type { Font } from "opentype.js"
import { memo, useMemo } from "react"

import { codePoints } from "@/core/cuneiform"

import type { StrokeStyle } from "./redraw/impression"
import type { RedrawLimits } from "./redraw/limits"
import type { ReviewSign } from "./reviewSigns"
import styles from "./SignTile.module.css"
import { SkeletonPicture } from "./SkeletonPicture"

/** Props for {@link SignTile}. */
export interface SignTileProps {
  sign: ReviewSign
  font: Font
  winkelhakenAngle: number
  style: StrokeStyle
  /** The file's limits, which pick out shapes too far off the ink. */
  limits?: RedrawLimits
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
  isSelected,
  onSelect,
}: SignTileProps) {
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
      aria-label={`${name}, ${status}`}
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
      />
      <span className={styles.name}>{name}</span>
      <span className={styles.score}>{status}</span>
    </button>
  )
})
