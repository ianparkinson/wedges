/** Helpers for plain numbers. */

/** `value` moved into the range from `min` to `max`, if it lies outside. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * The smallest of some numbers, or Infinity if there are none, as from
 * `Math.min`. Unlike `Math.min(...values)` it works on any number of values:
 * spreading a long array into a call overflows the stack.
 */
export function minOf(values: Iterable<number>): number {
  let min = Infinity
  for (const value of values) {
    if (Number.isNaN(value)) return NaN
    if (value < min) min = value
  }
  return min
}

/**
 * The largest of some numbers, or -Infinity if there are none, as from
 * `Math.max`. Unlike `Math.max(...values)` it works on any number of values.
 */
export function maxOf(values: Iterable<number>): number {
  let max = -Infinity
  for (const value of values) {
    if (Number.isNaN(value)) return NaN
    if (value > max) max = value
  }
  return max
}
