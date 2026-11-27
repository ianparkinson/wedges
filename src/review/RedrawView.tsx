import type { Font } from "opentype.js"
import { useMemo } from "react"

import { parseShape } from "@/core/skeleton"

import {
  EditablePicture,
  type EditablePictureProps,
} from "./edit/EditablePicture"
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
  /**
   * Shapes to compare with: any of `shapes` not among them is marked with
   * `unmatched`, such as "new".
   */
  others?: readonly string[]
  unmatched?: string
  showGlyph?: boolean
  showSkeleton?: boolean
  /** How to edit the shapes, to draw them so they can be dragged. */
  edit?: PictureEdit
  /** A class for the picture, to size or place it. */
  pictureClassName?: string
}

/** How {@link RedrawView} lets its shapes be edited. */
export type PictureEdit = Pick<
  EditablePictureProps,
  "tool" | "selected" | "onSelect" | "onEdit" | "onUndo" | "onRedo" | "onDrawn"
>

/**
 * A skeleton redrawn over its glyph, with each shape numbered at its start,
 * and the redraw check's scores for it and each of its shapes. Given `edit`,
 * the shapes can be dragged, and selected in the picture or the list.
 */
export function RedrawView({
  text,
  shapes,
  font,
  winkelhakenAngle,
  style,
  limits,
  others,
  unmatched,
  showGlyph,
  showSkeleton,
  edit,
  pictureClassName,
}: RedrawViewProps) {
  const parsed = useMemo(() => (shapes ?? []).map(parseShape), [shapes])
  const glyph = useMemo(() => readGlyph(font, text), [font, text])
  const score = useMemo(
    () =>
      glyph && parsed.length > 0
        ? redraw(glyph, parsed, winkelhakenAngle, style)
        : undefined,
    [glyph, parsed, winkelhakenAngle, style],
  )

  if (!shapes && !edit) return <p>No skeleton.</p>
  if (!glyph) return <p>The font has no glyph for this sign.</p>
  const astray =
    limits && score?.shapesOutside.map((o) => o > limits.shapeOutside)

  return (
    <>
      {edit ? (
        <EditablePicture
          text={text}
          shapes={shapes ?? []}
          font={font}
          winkelhakenAngle={winkelhakenAngle}
          style={style}
          astray={astray}
          showGlyph={showGlyph}
          showSkeleton={showSkeleton}
          className={pictureClassName}
          {...edit}
        />
      ) : (
        <SkeletonPicture
          className={[styles.picture, pictureClassName]
            .filter(Boolean)
            .join(" ")}
          text={text}
          shapes={shapes}
          font={font}
          winkelhakenAngle={winkelhakenAngle}
          style={style}
          astray={astray}
          showGlyph={showGlyph}
          showSkeleton={showSkeleton}
          numbered
        />
      )}

      {score && shapes && (
        <>
          <p className={styles.scores}>
            Overlap {score.overlap.toFixed(3)} · missed {percent(score.missed)}{" "}
            · outside {percent(score.outside)}
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
                const isAstray =
                  limits !== undefined && outside > limits.shapeOutside
                const isUnmatched =
                  others !== undefined && !others.includes(shape)
                return (
                  <tr
                    key={i}
                    className={
                      i === edit?.selected
                        ? styles.selected
                        : isAstray
                          ? styles.astray
                          : undefined
                    }
                    onClick={edit && (() => edit.onSelect(i))}
                  >
                    <td>{i + 1}</td>
                    <td>
                      <code>{shape}</code>
                      {isUnmatched && (
                        <span className={styles.unmatched}> {unmatched}</span>
                      )}
                    </td>
                    <td>{percent(outside)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}
    </>
  )
}

function percent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}
