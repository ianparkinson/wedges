import type { Font } from "opentype.js"
import { useState } from "react"

import { codePoints } from "@/core/cuneiform"
import { Button } from "@/ui/Button/Button"

import { isChanged } from "./compare"
import { draftShapes } from "./edit/draftShapes"
import { ShapesText } from "./edit/ShapesText"
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
  /** Saves new shapes for the sign. Rejects, saying why, if it can't. */
  onSave: (shapes: readonly string[]) => Promise<void>
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}

/**
 * One sign in detail: its skeleton redrawn over its glyph, and the same as
 * it was in the version compared with, if it has changed. Its shapes can be
 * edited as text, redrawn as they're typed. Give each sign its own `key`, so
 * that an edit doesn't carry over to the next sign.
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
  onSave,
  onPrevious,
  onNext,
  onClose,
}: SignDetailProps) {
  const before = comparedWith && isChanged(sign) ? sign.before : undefined
  const [draft, setDraft] = useState<string>()
  const [saving, setSaving] = useState<{ error?: string; isSaving: boolean }>({
    isSaving: false,
  })
  const drafted = draft === undefined ? undefined : draftShapes(draft)
  const shapes = drafted
    ? drafted.shapes.length > 0
      ? drafted.shapes
      : undefined
    : sign.shapes

  const save = () => {
    if (!drafted) return
    setSaving({ isSaving: true })
    onSave(drafted.shapes).then(
      () => {
        setDraft(undefined)
        setSaving({ isSaving: false })
      },
      (error: unknown) => setSaving({ isSaving: false, error: String(error) }),
    )
  }

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
        shapes={shapes}
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

      {draft === undefined ? (
        <div>
          <Button onPress={() => setDraft((sign.shapes ?? []).join("\n"))}>
            {sign.shapes ? "Edit shapes" : "Add shapes"}
          </Button>
        </div>
      ) : (
        <ShapesText
          value={draft}
          onChange={setDraft}
          problems={drafted!.problems}
          error={saving.error}
          isSaving={saving.isSaving}
          onSave={save}
          onCancel={() => {
            setDraft(undefined)
            setSaving({ isSaving: false })
          }}
        />
      )}

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
