import { useEffect, useRef, type PointerEvent, type RefObject } from "react"
import { useMediaQuery, useResizeObserver } from "usehooks-ts"

import type { Point } from "@/core/geometry"
import { classifyTrace, type Stroke } from "@/core/strokes"

import styles from "./DrawingPad.module.css"
import { paintPad } from "./paint"

/** A wedge's head is drawn this deep, as a fraction of the pad's smaller side. */
const HEAD_SIZE_FRACTION = 0.06

/** Props for {@link DrawingPad}. */
export interface DrawingPadProps {
  /** The strokes drawn so far, in CSS pixels from the pad's top left. */
  strokes: readonly Stroke[]
  /** Called with each new stroke when the finger lifts. Taps are ignored. */
  onStroke: (stroke: Stroke) => void
}

/**
 * The canvas a sign is drawn on, one stroke per finger-down. It shows the
 * strokes as impressions in clay, and the stroke in progress as a thin line.
 */
export function DrawingPad({ strokes, onStroke }: DrawingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const traceRef = useRef<{ pointerId: number; points: Point[] } | null>(null)

  // usehooks-ts types its refs as they were before React 19, without null.
  const { width = 0, height = 0 } = useResizeObserver({
    ref: canvasRef as RefObject<HTMLCanvasElement>,
  })

  // Re-renders when the colour scheme changes, so the strokes are repainted
  // in its colours.
  useMediaQuery("(prefers-color-scheme: dark)")

  // Painting reads the latest props without re-rendering on every move.
  const paint = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const style = getComputedStyle(canvas)
    const scale = canvas.width / (width || 1)
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    paintPad(ctx, {
      strokes,
      trace: traceRef.current?.points ?? null,
      headSize: HEAD_SIZE_FRACTION * Math.min(width, height),
      impressionColor: style.getPropertyValue("--color-impression"),
      traceColor: style.getPropertyValue("--color-trace"),
    })
  }

  useEffect(paint)

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (traceRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    traceRef.current = {
      pointerId: event.pointerId,
      points: [padPoint(event.currentTarget, event.nativeEvent)],
    }
    paint()
  }

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const trace = traceRef.current
    if (trace?.pointerId !== event.pointerId) return

    // Browsers deliver one move event per frame; the coalesced events hold
    // every position the pointer passed through, so fast strokes keep their
    // shape. Browsers offer them only in a secure context, so not over plain
    // HTTP to a phone on the local network, and the list is empty for events
    // a script dispatched.
    const coalesced = event.nativeEvent.getCoalescedEvents?.() ?? []
    const moves = coalesced.length > 0 ? coalesced : [event.nativeEvent]
    for (const move of moves) {
      trace.points.push(padPoint(event.currentTarget, move))
    }
    paint()
  }

  const onPointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const trace = traceRef.current
    if (trace?.pointerId !== event.pointerId) return

    traceRef.current = null
    const stroke = classifyTrace(trace.points)
    if (stroke) onStroke(stroke)
    paint()
  }

  const onPointerCancel = (event: PointerEvent<HTMLCanvasElement>) => {
    if (traceRef.current?.pointerId !== event.pointerId) return
    traceRef.current = null
    paint()
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.pad}
      width={Math.round(width * devicePixelRatio)}
      height={Math.round(height * devicePixelRatio)}
      role="img"
      aria-label={`Drawing pad, ${strokeCount(strokes.length)}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    />
  )
}

function padPoint(canvas: HTMLCanvasElement, event: MouseEvent): Point {
  const rect = canvas.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

function strokeCount(count: number): string {
  return count === 1 ? "1 stroke" : `${count} strokes`
}
