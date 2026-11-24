import type { Font } from "opentype.js"
import { memo } from "react"

import { codePoints } from "@/core/cuneiform"

import type { StrokeStyle } from "./redraw/impression"
import type { ReviewSign } from "./reviewSigns"
import styles from "./SignTile.module.css"
import { SkeletonPicture } from "./SkeletonPicture"

/** Props for {@link SignTile}. */
export interface SignTileProps {
  sign: ReviewSign
  font: Font
  winkelhakenAngle: number
  style: StrokeStyle
}

/**
 * A glyph with its skeleton drawn over it, and its name. It draws again
 * only when its props change, since the page has hundreds.
 */
export const SignTile = memo(function SignTile({
  sign,
  font,
  winkelhakenAngle,
  style,
}: SignTileProps) {
  const name = sign.name ?? codePoints(sign.text)
  const status = sign.shapes ? undefined : "no skeleton"

  return (
    <figure
      className={styles.tile}
      aria-label={[name, ...(status ? [status] : [])].join(", ")}
    >
      <SkeletonPicture
        text={sign.text}
        shapes={sign.shapes}
        font={font}
        winkelhakenAngle={winkelhakenAngle}
        style={style}
      />
      <figcaption className={styles.name}>{name}</figcaption>
      {status && <span className={styles.score}>{status}</span>}
    </figure>
  )
})
