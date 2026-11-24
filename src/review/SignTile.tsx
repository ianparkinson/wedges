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
}

/**
 * A glyph with its skeleton drawn over it, its name, and its overlap score.
 * It draws again only when its props change, since the page has hundreds.
 */
export const SignTile = memo(function SignTile({
  sign,
  font,
  winkelhakenAngle,
  style,
  limits,
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
    <figure className={styles.tile} aria-label={`${name}, ${status}`}>
      <SkeletonPicture
        text={sign.text}
        shapes={sign.shapes}
        font={font}
        winkelhakenAngle={winkelhakenAngle}
        style={style}
        astray={astray}
      />
      <figcaption className={styles.name}>{name}</figcaption>
      <span className={styles.score}>{status}</span>
    </figure>
  )
})
