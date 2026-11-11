import { useId } from "react"

import type { Stroke } from "@/core/strokes"
import { strokeOutline } from "@/core/strokeShape"
import type { Point } from "@/lib/geometry"

import styles from "./StrokeDiagram.module.css"

/** The diagram's size, in SVG units: wide enough for a wedge lying flat. */
const WIDTH = 120
const HEIGHT = 80

/** How deep a wedge's head is drawn, in SVG units. */
const HEAD_SIZE = 18

/** Props for {@link StrokeDiagram}. */
export interface StrokeDiagramProps {
  /** The stroke, in SVG units within 120 × 80. */
  stroke: Stroke
  /**
   * The finger's path, from where it lands to where it lifts, in the same
   * units. It is drawn as an arrow beside the stroke, not over it.
   */
  path: readonly Point[]
}

/**
 * A picture of how to draw a stroke: its impression on a patch of clay, as
 * the drawing pad shows it, and an arrow for the finger's path. It is
 * decorative, so the text beside it must say the same.
 */
export function StrokeDiagram({ stroke, path }: StrokeDiagramProps) {
  const arrowId = useId()
  const start = path[0]
  return (
    <svg
      className={styles.diagram}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-hidden="true"
    >
      <defs>
        <marker
          id={arrowId}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path className={styles.arrowHead} d="M0 0L10 5L0 10Z" />
        </marker>
      </defs>
      <rect className={styles.clay} width={WIDTH} height={HEIGHT} rx="8" />
      <path
        className={styles.impression}
        d={pathData(strokeOutline(stroke, HEAD_SIZE), true)}
      />
      <path
        className={styles.path}
        d={pathData(path, false)}
        markerEnd={`url(#${arrowId})`}
      />
      {start && (
        <circle className={styles.start} cx={start.x} cy={start.y} r="3" />
      )}
    </svg>
  )
}

function pathData(points: readonly Point[], closed: boolean): string {
  const [first, ...rest] = points
  if (!first) return ""
  const moves = [`M${first.x} ${first.y}`, ...rest.map((p) => `L${p.x} ${p.y}`)]
  return moves.join("") + (closed ? "Z" : "")
}
