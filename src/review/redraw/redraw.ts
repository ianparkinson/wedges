/**
 * The redraw check: a skeleton drawn back in its font's style and compared
 * with the font's glyph, pixel by pixel. See docs/review-tooling.md.
 */
import type { Shape } from "@/core/skeleton"
import { boundingBox, type Box, type Polygon } from "@/lib/geometry"

import type { Glyph } from "./glyphs"
import { impression, type StrokeStyle } from "./impression"

/** Pixels per skeleton unit: 3 makes a glyph about 300 pixels across. */
const SCALE = 2

/** A pixel counts as covered when it's at least half filled. */
const COVERED = 128

/** How well a skeleton, drawn back, covers its glyph, each from 0 to 1. */
export interface RedrawScore {
  /** The area both cover, over the area either covers: 1 is a perfect fit. */
  readonly overlap: number
  /** The fraction of the glyph's ink that the skeleton leaves uncovered. */
  readonly missed: number
  /** The fraction of the drawn skeleton that lies outside the ink. */
  readonly outside: number
  /** For each shape, the fraction of it that lies outside the ink. */
  readonly shapesOutside: readonly number[]
}

/**
 * Pixels over a box in skeleton units, `SCALE` to the unit, row by row from
 * the top: 1 where covered, 0 elsewhere.
 */
export interface Raster {
  readonly box: Box
  readonly width: number
  readonly height: number
  readonly pixels: Uint8Array
}

/** A redraw check's score, with the rasters it compared, for display. */
export interface Redraw {
  readonly score: RedrawScore
  /** The glyph's ink. */
  readonly ink: Raster
  /** Every shape drawn together, on the same grid as the ink. */
  readonly drawn: Raster
}

/**
 * Draws `shapes` in `style`, and compares them with `glyph`. Drawing uses
 * `OffscreenCanvas`, which tests provide in Node: see test/setup.ts.
 */
export function redraw(
  glyph: Glyph,
  shapes: readonly Shape[],
  winkelhakenAngle: number,
  style: StrokeStyle,
): Redraw {
  const impressions = shapes.map((shape) =>
    impression(shape, winkelhakenAngle, style),
  )
  const box = padded(
    boundingBox([
      { x: glyph.box.left, y: glyph.box.top },
      { x: glyph.box.right, y: glyph.box.bottom },
      ...impressions.flat(2),
    ]),
  )

  const canvas = new Canvas(box)
  const ink = canvas.rasterize((context) => {
    // Six decimal places keep the outline to a millionth of a unit.
    context.fill(new Path2D(glyph.path.toPathData(6)))
  })
  const drawn = canvas.rasterize((context) => fill(context, impressions.flat()))
  const both = count(ink, drawn)
  const inkArea = count(ink)
  const drawnArea = count(drawn)

  return {
    score: {
      overlap: both / Math.max(1, inkArea + drawnArea - both),
      missed: 1 - both / Math.max(1, inkArea),
      outside: 1 - both / Math.max(1, drawnArea),
      shapesOutside: impressions.map((polygons) => {
        const shape = canvas.rasterize(
          (context) => fill(context, polygons),
          boundingBox(polygons.flat()),
        )
        return 1 - count(shape, ink) / Math.max(1, count(shape))
      }),
    },
    ink,
    drawn,
  }
}

/** What drawing needs from a context, onscreen or offscreen. */
type Context = CanvasPath & CanvasDrawPath

/** One canvas over a box in skeleton units, drawn on again and again. */
class Canvas {
  private readonly width: number
  private readonly height: number
  private readonly context: OffscreenCanvasRenderingContext2D

  constructor(private readonly box: Box) {
    this.width = Math.ceil((box.right - box.left) * SCALE)
    this.height = Math.ceil((box.bottom - box.top) * SCALE)
    this.context = new OffscreenCanvas(this.width, this.height).getContext(
      "2d",
    )!
    this.context.fillStyle = "black"
  }

  /**
   * The pixels covered by what `draw` draws in skeleton units, within
   * `within` if given, or else the whole box. The result keeps the canvas's
   * grid, so its pixels line up with other rasters from the same canvas.
   */
  rasterize(draw: (context: Context) => void, within?: Box): Raster {
    const { box, context } = this
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, this.width, this.height)
    context.setTransform(
      SCALE,
      0,
      0,
      SCALE,
      -box.left * SCALE,
      -box.top * SCALE,
    )
    draw(context)

    const column = (x: number) => (x - box.left) * SCALE
    const row = (y: number) => (y - box.top) * SCALE
    const left = within ? Math.max(0, Math.floor(column(within.left))) : 0
    const top = within ? Math.max(0, Math.floor(row(within.top))) : 0
    const right = within
      ? Math.min(this.width, Math.ceil(column(within.right)))
      : this.width
    const bottom = within
      ? Math.min(this.height, Math.ceil(row(within.bottom)))
      : this.height
    const width = right - left
    const height = bottom - top

    const rgba = context.getImageData(left, top, width, height).data
    const pixels = new Uint8Array(width * height)
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = rgba[4 * i + 3]! >= COVERED ? 1 : 0
    }
    return {
      box: {
        left: box.left + left / SCALE,
        top: box.top + top / SCALE,
        right: box.left + right / SCALE,
        bottom: box.top + bottom / SCALE,
      },
      width,
      height,
      pixels,
    }
  }
}

/** Fills polygons together, by the nonzero rule, as fonts fill outlines. */
function fill(context: Context, polygons: readonly Polygon[]): void {
  context.beginPath()
  for (const [first, ...rest] of polygons) {
    if (!first) continue
    context.moveTo(first.x, first.y)
    for (const p of rest) context.lineTo(p.x, p.y)
    context.closePath()
  }
  context.fill()
}

/**
 * How many pixels are covered in `a`, or in both `a` and `b` when given. The
 * rasters must come from the same canvas, and `b` must hold all of `a`.
 */
function count(a: Raster, b?: Raster): number {
  const dx = b ? Math.round((a.box.left - b.box.left) * SCALE) : 0
  const dy = b ? Math.round((a.box.top - b.box.top) * SCALE) : 0
  let total = 0
  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const covered = a.pixels[y * a.width + x]!
      total += b ? covered & b.pixels[(y + dy) * b.width + x + dx]! : covered
    }
  }
  return total
}

/** `box` with a pixel's margin all round, so no outline lies on its edge. */
function padded(box: Box): Box {
  const margin = 1 / SCALE
  return {
    left: box.left - margin,
    right: box.right + margin,
    top: box.top - margin,
    bottom: box.bottom + margin,
  }
}
