import type { Font } from "opentype.js"
import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react"

import { parseShape, shapeKeyPoints, type Shape } from "@/core/skeleton"
import { boundingBox, type Point } from "@/lib/geometry"
import { glyphOutline } from "@/review/glyphOutline"
import { impression, type StrokeStyle } from "@/review/redraw/impression"
import { svgPath } from "@/review/svgPath"

import styles from "./EditablePicture.module.css"
import {
  formatShape,
  lengthenShape,
  moveShape,
  openWinkelhaken,
  pointShape,
  shapeHandles,
  traceLeg,
  turnShape,
  widenHead,
  type HandleRole,
} from "./shapeEdits"

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
}

/** Space around the glyph and shapes, in skeleton units, to drag into. */
const MARGIN = 12
const NUMBER_SIZE = 6
const HANDLE_RADIUS = 2
/** How far the arrow keys move, and the - and = keys lengthen, with Shift. */
const BIG_STEP = 5
/** How far [ and ] turn a shape with Shift, in degrees. */
const BIG_TURN = 15

/** A drag under way: what it changes, and the shape as it was when it began. */
interface Drag {
  readonly role: HandleRole | "move"
  readonly from: Point
  readonly shape: Shape
  changed: boolean
}

/**
 * A glyph with its skeleton drawn over it, whose shapes can be selected and
 * dragged: by the body to move one, or by its handles to point it, widen a
 * wedge's head, or open a Winkelhaken. Directions snap to multiples of 45°
 * unless Alt is held. With a shape selected, the arrow keys move it, [ and ]
 * turn it, and - and = shorten and lengthen it, by more with Shift.
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
  selected,
  onSelect,
  onEdit,
  onUndo,
  onRedo,
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

  const replace = (index: number, shape: Shape, continuing: boolean) =>
    onEdit(shapes.with(index, formatShape(shape)), continuing)

  const startDrag = (
    event: PointerEvent,
    role: Drag["role"],
    index: number,
  ) => {
    event.stopPropagation()
    svg.current!.setPointerCapture(event.pointerId)
    onSelect(index)
    drag.current = {
      role,
      from: toSkeleton(svg.current!, event),
      shape: parsed[index]!,
      changed: false,
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    const d = drag.current
    if (!d || selected === undefined) return
    const to = toSkeleton(svg.current!, event)
    const snap = !event.altKey
    const shape = dragged(d, to, snap, winkelhakenAngle)
    replace(selected, shape, d.changed)
    d.changed = true
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const command = event.ctrlKey || event.metaKey
    const key = event.key.toLowerCase()
    if (command && (key === "y" || (key === "z" && event.shiftKey))) {
      onRedo()
    } else if (command && key === "z") {
      onUndo()
    } else if (event.key === "Escape" && current) {
      onSelect(undefined)
    } else if (current && selected !== undefined && !command) {
      const shape = keyed(current, event.key, event.shiftKey)
      if (!shape) return
      replace(selected, shape, false)
    } else {
      return
    }
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <svg
      ref={svg}
      className={styles.picture}
      viewBox={viewBox}
      tabIndex={0}
      role="application"
      aria-label="Skeleton editor"
      onPointerDown={() => onSelect(undefined)}
      onPointerMove={onPointerMove}
      onPointerUp={() => (drag.current = undefined)}
      onPointerCancel={() => (drag.current = undefined)}
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
            onPointerDown={(e) => startDrag(e, "move", i)}
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
      {current &&
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
              onPointerDown={(e) => startDrag(e, role, selected)}
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
              onPointerDown={(e) => startDrag(e, role, selected)}
            />
          ),
        )}
    </svg>
  )
}

/** The shape a drag makes, from the shape as it was when the drag began. */
function dragged(
  { role, from, shape }: Drag,
  to: Point,
  snap: boolean,
  winkelhakenAngle: number,
): Shape {
  switch (role) {
    case "move":
      return moveShape(shape, to.x - from.x, to.y - from.y)
    case "point":
      return pointedBy(shape, to, snap, winkelhakenAngle)
    case "head":
      return shape.kind === "wedge" ? widenHead(shape, to) : shape
    case "angle":
      return shape.kind === "winkelhaken"
        ? openWinkelhaken(shape, to, winkelhakenAngle, snap)
        : shape
  }
}

/** The shape a key makes, or undefined for a key that doesn't edit. */
function keyed(shape: Shape, key: string, big: boolean): Shape | undefined {
  const step = big ? BIG_STEP : 1
  const turn = big ? BIG_TURN : 1
  switch (key) {
    case "ArrowLeft":
      return moveShape(shape, -step, 0)
    case "ArrowRight":
      return moveShape(shape, step, 0)
    case "ArrowUp":
      return moveShape(shape, 0, step)
    case "ArrowDown":
      return moveShape(shape, 0, -step)
    case "[":
    case "{":
      return turnShape(shape, turn)
    case "]":
    case "}":
      return turnShape(shape, -turn)
    case "-":
    case "_":
      return lengthenShape(shape, -step)
    case "=":
    case "+":
      return lengthenShape(shape, step)
    default:
      return undefined
  }
}

/**
 * The shape its point handle makes, which sets where it points and how long
 * it is: a wedge's tail end, or a Winkelhaken's traced leg.
 */
function pointedBy(
  shape: Shape,
  to: Point,
  snap: boolean,
  winkelhakenAngle: number,
): Shape {
  switch (shape.kind) {
    case "wedge":
      return pointShape(shape, to, snap)
    case "winkelhaken":
      return traceLeg(shape, to, winkelhakenAngle, snap)
  }
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
