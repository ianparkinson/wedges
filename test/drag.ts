import { fireEvent } from "@testing-library/react"

import type { Point } from "@/lib/geometry"

/** Moves per drag, so that the element sees a trace, not a jump. */
const STEPS = 20

/**
 * Drags pointer `pointerId` across `element` in a straight line from `from`
 * to `to`, in client coordinates, as a finger drawing one stroke would.
 */
export function drag(
  element: HTMLElement,
  from: Point,
  to: Point,
  pointerId = 1,
) {
  const at = (t: number) => ({
    pointerId,
    clientX: from.x + (to.x - from.x) * t,
    clientY: from.y + (to.y - from.y) * t,
  })

  fireEvent.pointerDown(element, at(0))
  for (let i = 1; i <= STEPS; i++) fireEvent.pointerMove(element, at(i / STEPS))
  fireEvent.pointerUp(element, at(1))
}
