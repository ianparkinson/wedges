import type { Font } from "opentype.js"
import { useMemo } from "react"

import { parseShape } from "@/core/skeleton"

import { glyph as readGlyph } from "./redraw/glyphs"
import type { StrokeStyle } from "./redraw/impression"
import type { RedrawLimits } from "./redraw/limits"
import { redraw } from "./redraw/redraw"
import styles from "./RedrawView.module.css"
import { SkeletonPicture } from "./SkeletonPicture"

/** Props for {@link RedrawView}. */
export interface RedrawViewProps {
  text: string
  shapes: readonly string[] | undefined
  font: Font
  winkelhakenAngle: number
  style: StrokeStyle
  limits?: RedrawLimits
  showGlyph?: boolean
  showSkeleton?: boolean
}

/**
 * A skeleton redrawn over its glyph, with each shape numbered at its start,
 * and the redraw check's scores for it and each of its shapes.
 */
export function RedrawView({
  text,
  shapes,
  font,
  winkelhakenAngle,
  style,
  limits,
  showGlyph,
  showSkeleton,
}: RedrawViewProps) {
  const parsed = useMemo(() => (shapes ?? []).map(parseShape), [shapes])
  const score = useMemo(() => {
    const glyph = readGlyph(font, text)
    return glyph && parsed.length > 0
      ? redraw(glyph, parsed, winkelhakenAngle, style)
      : undefined
  }, [font, text, parsed, winkelhakenAngle, style])

  if (!shapes) return <p>No skeleton.</p>
  if (!score) return <p>The font has no glyph for this sign.</p>

  return (
    <>
      <SkeletonPicture
        className={styles.picture}
        text={text}
        shapes={shapes}
        font={font}
        winkelhakenAngle={winkelhakenAngle}
        style={style}
        astray={
          limits && score.shapesOutside.map((o) => o > limits.shapeOutside)
        }
        showGlyph={showGlyph}
        showSkeleton={showSkeleton}
        numbered
      />

      <p className={styles.scores}>
        Overlap {score.overlap.toFixed(3)} · missed {percent(score.missed)} ·
        outside {percent(score.outside)}
      </p>

      <table className={styles.shapes}>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Shape</th>
            <th scope="col">Outside the ink</th>
          </tr>
        </thead>
        <tbody>
          {shapes.map((shape, i) => {
            const outside = score.shapesOutside[i] ?? 0
            const astray = limits !== undefined && outside > limits.shapeOutside
            return (
              <tr key={i} className={astray ? styles.astray : undefined}>
                <td>{i + 1}</td>
                <td>
                  <code>{shape}</code>
                </td>
                <td>{percent(outside)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

function percent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}
