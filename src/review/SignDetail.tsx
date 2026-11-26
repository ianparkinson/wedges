import type { Font } from "opentype.js"

import { codePoints } from "@/core/cuneiform"
import { Button } from "@/ui/Button/Button"

import { isChanged } from "./compare"
import type { StrokeStyle } from "./redraw/impression"
import type { RedrawLimits } from "./redraw/limits"
import { RedrawView } from "./RedrawView"
import type { ReviewSign } from "./reviewSigns"
import styles from "./SignDetail.module.css"
import type { ComparedWith } from "./useComparison"

/** Props for {@link SignDetail}. */
export interface SignDetailProps {
  sign: ReviewSign
  font: Font
  winkelhakenAngle: number
  style: StrokeStyle
  limits?: RedrawLimits
  /** The version compared with, shown below when the sign has changed. */
  comparedWith?: ComparedWith
  isReviewed: boolean
  showGlyph: boolean
  showSkeleton: boolean
  onShowGlyphChange: (show: boolean) => void
  onShowSkeletonChange: (show: boolean) => void
  onReviewedChange: (reviewed: boolean) => void
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}

/**
 * One sign in detail: its skeleton redrawn over its glyph, and the same as
 * it was in the version compared with, if it has changed.
 */
export function SignDetail({
  sign,
  font,
  winkelhakenAngle,
  style,
  limits,
  comparedWith,
  isReviewed,
  showGlyph,
  showSkeleton,
  onShowGlyphChange,
  onShowSkeletonChange,
  onReviewedChange,
  onPrevious,
  onNext,
  onClose,
}: SignDetailProps) {
  const before = comparedWith && isChanged(sign) ? sign.before : undefined

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
            onChange={(e) => onShowGlyphChange(e.target.checked)}
          />{" "}
          Glyph (G)
        </label>
        <label>
          <input
            type="checkbox"
            checked={showSkeleton}
            onChange={(e) => onShowSkeletonChange(e.target.checked)}
          />{" "}
          Skeleton (S)
        </label>
      </div>

      <RedrawView
        text={sign.text}
        shapes={sign.shapes}
        font={font}
        winkelhakenAngle={winkelhakenAngle}
        style={style}
        limits={limits}
        others={before?.shapes}
        unmatched="new"
        showGlyph={showGlyph}
        showSkeleton={showSkeleton}
      />
      {sign.comments && <p>{sign.comments}</p>}

      {comparedWith && before && (
        <>
          <h3 className={styles.subtitle}>
            Before{before.glyphChanged && ", in the old font"}
          </h3>
          <RedrawView
            text={sign.text}
            shapes={before.shapes}
            font={comparedWith.font}
            winkelhakenAngle={comparedWith.winkelhakenAngle}
            style={comparedWith.style}
            others={sign.shapes}
            unmatched="removed"
            showGlyph={showGlyph}
            showSkeleton={showSkeleton}
          />
        </>
      )}

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
