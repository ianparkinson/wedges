import type { Font } from "opentype.js"
import { useState } from "react"

import { codePoints } from "@/core/cuneiform"
import { Button } from "@/ui/Button/Button"

import type { StrokeStyle } from "./redraw/impression"
import type { RedrawLimits } from "./redraw/limits"
import { RedrawView } from "./RedrawView"
import type { ReviewSign } from "./reviewSigns"
import styles from "./SignDetail.module.css"

/** Props for {@link SignDetail}. */
export interface SignDetailProps {
  sign: ReviewSign
  font: Font
  winkelhakenAngle: number
  style: StrokeStyle
  limits?: RedrawLimits
  isReviewed: boolean
  onReviewedChange: (reviewed: boolean) => void
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}

/** One sign in detail: its skeleton redrawn over its glyph, larger. */
export function SignDetail({
  sign,
  font,
  winkelhakenAngle,
  style,
  limits,
  isReviewed,
  onReviewedChange,
  onPrevious,
  onNext,
  onClose,
}: SignDetailProps) {
  const [showGlyph, setShowGlyph] = useState(true)
  const [showSkeleton, setShowSkeleton] = useState(true)

  return (
    <section className={styles.detail} aria-label="Sign detail">
      <header className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.glyph}>{sign.text}</span>{" "}
          {sign.name ?? "Not in OSL"}
        </h2>
        <p className={styles.codePoints}>{codePoints(sign.text)}</p>
      </header>

      <div className={styles.layers}>
        <label>
          <input
            type="checkbox"
            checked={showGlyph}
            onChange={(e) => setShowGlyph(e.target.checked)}
          />{" "}
          Glyph
        </label>
        <label>
          <input
            type="checkbox"
            checked={showSkeleton}
            onChange={(e) => setShowSkeleton(e.target.checked)}
          />{" "}
          Skeleton
        </label>
      </div>

      <RedrawView
        text={sign.text}
        shapes={sign.shapes}
        font={font}
        winkelhakenAngle={winkelhakenAngle}
        style={style}
        limits={limits}
        showGlyph={showGlyph}
        showSkeleton={showSkeleton}
      />
      {sign.comments && <p>{sign.comments}</p>}

      <div className={styles.actions}>
        {sign.shapes && (
          <label>
            <input
              type="checkbox"
              checked={isReviewed}
              onChange={(e) => onReviewedChange(e.target.checked)}
            />{" "}
            Reviewed (R)
          </label>
        )}
        <Button onPress={onPrevious}>Previous (←)</Button>
        <Button onPress={onNext}>Next (→)</Button>
        <Button onPress={onClose}>Close (Esc)</Button>
      </div>
    </section>
  )
}
