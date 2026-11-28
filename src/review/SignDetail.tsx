import type { Font } from "opentype.js"
import { useEffect, useState } from "react"

import { codePoints } from "@/core/cuneiform"
import { Button } from "@/ui/Button/Button"

import { isChanged } from "./compare"
import { SkeletonEditor } from "./edit/SkeletonEditor"
import { isPageKey } from "./pageKeys"
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
  /** Whether the detail fills the window, with a larger picture. */
  isExpanded: boolean
  onShowGlyphChange: (show: boolean) => void
  onShowSkeletonChange: (show: boolean) => void
  onExpandedChange: (expanded: boolean) => void
  onReviewedChange: (reviewed: boolean) => void
  /** Saves new shapes for the sign. Rejects, saying why, if it can't. */
  onSave: (shapes: readonly string[]) => Promise<void>
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}

/**
 * One sign in detail: its skeleton redrawn over its glyph, and the same as
 * it was in the version compared with, if it has changed. Its shapes can be
 * edited, by dragging or as text. Give each sign its own `key`, so that an
 * edit doesn't carry over to the next sign. Expanded, it fills the window,
 * with the picture as large as fits beside the rest. E starts an edit.
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
  isExpanded,
  onShowGlyphChange,
  onShowSkeletonChange,
  onExpandedChange,
  onReviewedChange,
  onSave,
  onPrevious,
  onNext,
  onClose,
}: SignDetailProps) {
  const before = comparedWith && isChanged(sign) ? sign.before : undefined
  const [isEditing, setEditing] = useState(false)
  const pictureClassName = isExpanded ? styles.mainPicture : undefined

  useEffect(() => {
    if (isEditing) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "e" || !isPageKey(event)) return
      event.preventDefault()
      setEditing(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isEditing])

  return (
    <section
      className={isExpanded ? styles.expanded : styles.detail}
      aria-label="Sign detail"
    >
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
        <label>
          <input
            type="checkbox"
            checked={isExpanded}
            onChange={(e) => onExpandedChange(e.target.checked)}
          />{" "}
          Full window (F)
        </label>
      </div>

      {isEditing ? (
        <SkeletonEditor
          text={sign.text}
          shapes={sign.shapes}
          font={font}
          winkelhakenAngle={winkelhakenAngle}
          style={style}
          limits={limits}
          others={before?.shapes}
          showGlyph={showGlyph}
          showSkeleton={showSkeleton}
          pictureClassName={pictureClassName}
          onSave={onSave}
          onDone={() => setEditing(false)}
        />
      ) : (
        <>
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
            pictureClassName={pictureClassName}
          />
          <div>
            <Button onPress={() => setEditing(true)}>
              {sign.shapes ? "Edit shapes (E)" : "Add shapes (E)"}
            </Button>
          </div>
        </>
      )}
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
