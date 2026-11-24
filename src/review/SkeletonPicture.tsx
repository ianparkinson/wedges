import type { Font } from "opentype.js"
import { useMemo } from "react"

import { parseShape } from "@/core/skeleton"
import { boundingBox, type Box, type Point } from "@/lib/geometry"

import { glyph as readGlyph } from "./redraw/glyphs"
import { impression, type StrokeStyle } from "./redraw/impression"
import styles from "./SkeletonPicture.module.css"
import { svgPath } from "./svgPath"

/** Props for {@link SkeletonPicture}. */
export interface SkeletonPictureProps {
  text: string
  shapes: readonly string[] | undefined
  font: Font
  winkelhakenAngle: number
  style: StrokeStyle
  /** Which shapes to pick out as too far off the ink, by index. */
  astray?: readonly boolean[]
}

/** Margin around a glyph, in skeleton units. */
const MARGIN = 4

/** A glyph with its skeleton drawn over it, in the font's stroke style. */
export function SkeletonPicture({
  text,
  shapes,
  font,
  winkelhakenAngle,
  style,
  astray,
}: SkeletonPictureProps) {
  const picture = useMemo(() => {
    const glyph = glyphOutline(font, text)
    const outlines = (shapes ?? []).map((s) =>
      impression(parseShape(s), winkelhakenAngle, style),
    )
    const all = [...boxCorners(glyph?.box), ...outlines.flat(2)]
    const box = all.length > 0 ? boundingBox(all) : undefined
    const viewBox = box
      ? [
          box.left - MARGIN,
          box.top - MARGIN,
          box.right - box.left + 2 * MARGIN,
          box.bottom - box.top + 2 * MARGIN,
        ].join(" ")
      : "0 -100 100 100"
    return { glyph, outlines, viewBox }
  }, [font, text, shapes, winkelhakenAngle, style])

  return (
    <svg
      className={styles.picture}
      viewBox={picture.viewBox}
      aria-hidden="true"
    >
      {picture.glyph && <path className={styles.ink} d={picture.glyph.d} />}
      {picture.outlines.map((outline, i) => (
        <path
          key={i}
          className={astray?.[i] ? styles.astray : styles.shape}
          d={svgPath(outline)}
        />
      ))}
    </svg>
  )
}

/** A glyph's outline as SVG path data, with its box. */
interface GlyphOutline {
  readonly d: string
  readonly box: Box
}

/**
 * Glyph outlines already worked out, for each font: the page draws each
 * glyph again and again, and turning it into path data takes a while.
 */
const outlines = new WeakMap<Font, Map<string, GlyphOutline | undefined>>()

function glyphOutline(font: Font, text: string): GlyphOutline | undefined {
  let forFont = outlines.get(font)
  if (!forFont) {
    forFont = new Map()
    outlines.set(font, forFont)
  }
  if (!forFont.has(text)) {
    const glyph = readGlyph(font, text)
    forFont.set(text, glyph && { d: glyph.path.toPathData(2), box: glyph.box })
  }
  return forFont.get(text)
}

/** A box's top-left and bottom-right corners, or none for no box. */
function boxCorners(box: Box | undefined): Point[] {
  return box
    ? [
        { x: box.left, y: box.top },
        { x: box.right, y: box.bottom },
      ]
    : []
}
