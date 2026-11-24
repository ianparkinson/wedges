/**
 * The redraw check's limits, which the data test holds skeleton files to.
 */

/** How far a sign's redraw may stray from its glyph. */
export interface RedrawLimits {
  /** The lowest overlap allowed between the redrawn skeleton and its glyph. */
  readonly overlap: number
  /** The largest fraction of any one shape allowed to lie outside the ink. */
  readonly shapeOutside: number
}

/**
 * The limits for each skeleton file that has them, by the file's name. A
 * sign outside them most likely has a stroke missing, or one in the wrong
 * place.
 */
export const redrawLimits: Readonly<Record<string, RedrawLimits>> = {
  "noto-next": { overlap: 0.75, shapeOutside: 0.3 },
}
