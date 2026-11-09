import type { Point } from "@/core/geometry"
import type { Stroke } from "@/core/strokes"
import { strokeOutline } from "@/core/strokeShape"
import { tidyStroke } from "@/core/tidyStroke"

/** What {@link paintPad} draws, in CSS pixels. */
export interface PadPicture {
  readonly strokes: readonly Stroke[]
  /** The trace of the stroke being drawn, if a finger is down. */
  readonly trace: readonly Point[] | null
  /** How deep a wedge's head is drawn. */
  readonly headSize: number
  readonly impressionColor: string
  readonly traceColor: string
}

const TRACE_WIDTH = 3

/**
 * Clears the canvas and draws the strokes as impressions in clay, tidied by
 * {@link tidyStroke}, with the trace in progress as a thin line over them.
 * The context must already be scaled so that one unit is one CSS pixel.
 */
export function paintPad(ctx: CanvasRenderingContext2D, picture: PadPicture) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.fillStyle = picture.impressionColor
  ctx.strokeStyle = picture.impressionColor
  ctx.lineJoin = "round"
  ctx.lineWidth = 1
  for (const stroke of picture.strokes) {
    const tidy = tidyStroke(stroke)
    tracePath(ctx, strokeOutline(tidy, picture.headSize))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  if (picture.trace) {
    ctx.strokeStyle = picture.traceColor
    ctx.lineWidth = TRACE_WIDTH
    ctx.lineCap = "round"
    tracePath(ctx, picture.trace)
    ctx.stroke()
  }
}

function tracePath(ctx: CanvasRenderingContext2D, points: readonly Point[]) {
  ctx.beginPath()
  for (const { x, y } of points) ctx.lineTo(x, y)
}
