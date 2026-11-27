import type { Font } from "opentype.js"
import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react"

import { parseShape, shapeKeyPoints, type Shape } from "@/core/skeleton"
import { boundingBox, distance, type Point } from "@/lib/geometry"
import { glyphOutline } from "@/review/glyphOutline"
import { impression, type StrokeStyle } from "@/review/redraw/impression"
import { svgPath } from "@/review/svgPath"

import styles from "./EditablePicture.module.css"
import { dragged, keyed, type DragRole } from "./gestures"
import { formatShape, shapeHandles } from "./shapeEdits"

/**
 * What pressing on the picture does: select and drag shapes, or draw a new
 * wedge or Winkelhaken.
 */
export type EditTool = "select" | "wedge" | "winkelhaken"

/** Props for {@link EditablePicture}. */
export interface EditablePictureProps {
  text: string
  shapes: readonly string[]
  font: Font
  winkelhakenAngle: number
  style: StrokeStyle
  /** Which shapes to pick out as too far off the ink, by index. */
  astray?: readonly boolean[]
  showGlyph?: boolean
  showSkeleton?: boolean
  tool: EditTool
  /** The index of the selected shape. */
  selected?: number
  onSelect: (index: number | undefined) => void
  /**
   * Changes the shapes. `continuing` is true for each change of a drag after
   * the first, so the drag can be undone in one step.
   */
  onEdit: (shapes: readonly string[], continuing: boolean) => void
  onUndo: () => void
  onRedo: () => void
  /** Called when a new shape has been drawn, which is then selected. */
  onDrawn: () => void
  className?: string
}

/** Space around the glyph and shapes, in skeleton units, to drag into. */
const MARGIN = 12
const NUMBER_SIZE = 6
const HANDLE_RADIUS = 2
/** A new wedge's head width when the sign has no other wedges. */
const DEFAULT_HEAD = 20
/** A new Winkelhaken's leg, when it's placed without dragging. */
const DEFAULT_LEG = 14
/** The shortest drag that draws a shape: a shorter one is taken as a press. */
const MIN_NEW_SHAPE = 3

/** A drag under way. */
interface Drag {
  readonly role: DragRole
  /** Which shape the drag changes. */
  readonly index: number
  /** The shapes when the drag began, with the one being drawn, if any. */
  readonly shapes: readonly string[]
  readonly shape: Shape
  readonly from: Point
  /** Whether the drag draws a new shape, at `index`. */
  readonly isNew: boolean
  changed: boolean
}

/**
 * A glyph with its skeleton drawn over it, whose shapes can be selected and
 * dragged: by the body to move one, or by its handles to point it, widen a
 * wedge's head, or open a Winkelhaken. With the wedge or Winkelhaken tool,
 * dragging draws a new one, from a wedge's head to its tail end or from a
 * Winkelhaken's vertex along one leg (see traceLeg). Directions snap to multiples of
 * 45° unless Alt is held. With a shape selected, the arrow keys move it, [
 * and ] turn it, and - and = shorten and lengthen it, by more with Shift.
 */
export function EditablePicture({
  text,
  shapes,
  font,
  winkelhakenAngle,
  style,
  astray,
  showGlyph = true,
  showSkeleton = true,
  tool,
  selected,
  onSelect,
  onEdit,
  onUndo,
  onRedo,
  onDrawn,
  className,
}: EditablePictureProps) {
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<Drag | undefined>(undefined)
  const glyph = glyphOutline(font, text)
  const parsed = useMemo(() => shapes.map(parseShape), [shapes])
  const outlines = parsed.map((s) => impression(s, winkelhakenAngle, style))
  // Fixed while editing, so the picture doesn't shift under a drag.
  const [viewBox] = useState(() => {
    const box = boundingBox([
      ...(glyph
        ? [
            { x: glyph.box.left, y: glyph.box.top },
            { x: glyph.box.right, y: glyph.box.bottom },
          ]
        : []),
      ...outlines.flat(),
      { x: 0, y: 0 },
    ])
    return [
      box.left - MARGIN,
      box.top - MARGIN,
      box.right - box.left + 2 * MARGIN,
      box.bottom - box.top + 2 * MARGIN,
    ].join(" ")
  })
  const current = selected === undefined ? undefined : parsed[selected]

  const startDrag = (
    event: PointerEvent,
    role: DragRole,
    index: number,
    shape: Shape,
    isNew = false,
  ) => {
    event.stopPropagation()
    svg.current!.setPointerCapture(event.pointerId)
    onSelect(index)
    drag.current = {
      role,
      index,
      shapes,
      shape,
      from: toSkeleton(svg.current!, event),
      isNew,
      changed: false,
    }
  }

  const startDrawing = (event: PointerEvent) => {
    const at = roundPoint(toSkeleton(svg.current!, event))
    const shape: Shape =
      tool === "wedge"
        ? {
            kind: "wedge",
            start: at,
            direction: 0,
            length: 1,
            head: newHead(parsed),
          }
        : { kind: "winkelhaken", vertex: at, direction: 0, leg: DEFAULT_LEG }
    startDrag(event, "draw", shapes.length, shape, true)
  }

  const write = (d: Drag, shape: Shape) => {
    onEdit(
      d.shapes.toSpliced(d.index, d.isNew ? 0 : 1, formatShape(shape)),
      d.changed,
    )
    d.changed = true
  }

  const onPointerMove = (event: PointerEvent) => {
    const d = drag.current
    if (!d) return
    const to = toSkeleton(svg.current!, event)
    const shape = dragged(
      d.role,
      d.shape,
      d.from,
      to,
      { snap: !event.altKey, mirror: event.shiftKey },
      winkelhakenAngle,
    )
    if (d.isNew && distance(d.from, to) < MIN_NEW_SHAPE) return
    write(d, shape)
  }

  const endDrag = () => {
    const d = drag.current
    drag.current = undefined
    if (!d?.isNew) return
    // A Winkelhaken placed without a drag opens rightwards; a wedge needs a
    // drag to say where its tail goes.
    if (!d.changed && d.shape.kind === "winkelhaken") write(d, d.shape)
    if (d.changed) onDrawn()
    else onSelect(undefined)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const command = event.ctrlKey || event.metaKey
    const key = event.key.toLowerCase()
    if (command && (key === "y" || (key === "z" && event.shiftKey))) {
      onRedo()
    } else if (command && key === "z") {
      onUndo()
    } else if (event.key === "Escape" && current && tool === "select") {
      onSelect(undefined)
    } else if (current && selected !== undefined && !command) {
      const shape = keyed(current, event.key, event.shiftKey)
      if (!shape) return
      onEdit(shapes.with(selected, formatShape(shape)), false)
    } else {
      return
    }
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <svg
      ref={svg}
      className={[
        tool === "select" ? styles.picture : styles.drawing,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      viewBox={viewBox}
      tabIndex={0}
      role="application"
      aria-label="Skeleton editor"
      onPointerDown={(e) =>
        tool === "select" ? onSelect(undefined) : startDrawing(e)
      }
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    >
      {showGlyph && glyph && <path className={styles.ink} d={glyph.d} />}
      {showSkeleton &&
        outlines.map((outline, i) => (
          <path
            key={i}
            className={
              i === selected
                ? styles.selected
                : astray?.[i]
                  ? styles.astray
                  : styles.shape
            }
            d={svgPath([outline])}
            onPointerDown={
              tool === "select"
                ? (e) => startDrag(e, "move", i, parsed[i]!)
                : undefined
            }
          />
        ))}
      {showSkeleton &&
        parsed.map((shape, i) => {
          const start = shapeKeyPoints(shape, winkelhakenAngle)[0]!
          return (
            <text
              key={i}
              className={styles.number}
              x={start.x}
              y={start.y}
              fontSize={NUMBER_SIZE}
            >
              {i + 1}
            </text>
          )
        })}
      {tool === "select" &&
        current &&
        selected !== undefined &&
        shapeHandles(current, winkelhakenAngle).map(({ role, at }) =>
          role === "point" ? (
            <circle
              key={role}
              className={styles.handle}
              data-role={role}
              cx={at.x}
              cy={-at.y}
              r={HANDLE_RADIUS}
              onPointerDown={(e) => startDrag(e, role, selected, current)}
            />
          ) : (
            // A diamond, for a handle that changes the shape's width or
            // opening rather than where it points.
            <rect
              key={role}
              className={styles.widthHandle}
              data-role={role}
              x={at.x - HANDLE_RADIUS}
              y={-at.y - HANDLE_RADIUS}
              width={2 * HANDLE_RADIUS}
              height={2 * HANDLE_RADIUS}
              transform={`rotate(45 ${at.x} ${-at.y})`}
              onPointerDown={(e) => startDrag(e, role, selected, current)}
            />
          ),
        )}
    </svg>
  )
}

/**
 * The head width for a new wedge: the middle one of the sign's other wedges,
 * which are usually much alike, or a typical width if it has none.
 */
function newHead(shapes: readonly Shape[]): number {
  const heads = shapes
    .flatMap((s) => (s.kind === "wedge" ? [s.head] : []))
    .toSorted((a, b) => a - b)
  return heads[Math.floor(heads.length / 2)] ?? DEFAULT_HEAD
}

function roundPoint({ x, y }: Point): Point {
  return { x: Math.round(x), y: Math.round(y) }
}

/**
 * Where a pointer is, in the skeleton file's frame. The picture is only
 * scaled and shifted, never turned, so its screen matrix has no skew.
 */
function toSkeleton(
  svg: SVGSVGElement,
  { clientX, clientY }: PointerEvent,
): Point {
  const { a, d, e, f } = svg.getScreenCTM()!
  return { x: (clientX - e) / a, y: -(clientY - f) / d }
}
