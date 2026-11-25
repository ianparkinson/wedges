/**
 * The order of entries and shapes in a skeleton file, which
 * docs/skeleton-format.md fixes so that a tool rewriting a file changes only
 * what it must.
 */
import type { SkeletonEntry, SkeletonFile } from "./types"

/**
 * Compares two entries' texts one code point at a time, so a sign comes
 * before the ligatures that start with it. JavaScript's default string sort
 * compares UTF-16 code units instead, which puts U+12000 before U+E000.
 */
export function compareTexts(a: string, b: string): number {
  return compareSequences(codePoints(a), codePoints(b))
}

/**
 * Compares two shapes by x, then y, then the rest of the shape token by
 * token: the op as text and the numbers as numbers.
 */
export function compareShapes(a: string, b: string): number {
  const [opA, ...numbersA] = tokens(a)
  const [opB, ...numbersB] = tokens(b)
  const [xA = 0, yA = 0, ...restA] = numbersA
  const [xB = 0, yB = 0, ...restB] = numbersB
  return (
    xA - xB ||
    yA - yB ||
    opA.localeCompare(opB) ||
    compareSequences(restA, restB)
  )
}

/**
 * A skeleton file with its entries and their shapes in order. Entries with
 * the same text keep their order in the file.
 */
export function sortSkeletonFile(file: SkeletonFile): SkeletonFile {
  return {
    ...file,
    skeletons: file.skeletons
      .map(sortShapes)
      .toSorted((a, b) => compareTexts(a.text, b.text)),
  }
}

/** An entry with its shapes in order. */
function sortShapes(entry: SkeletonEntry): SkeletonEntry {
  return entry.shapes === undefined
    ? entry
    : { ...entry, shapes: entry.shapes.toSorted(compareShapes) }
}

/** A shape's op, then its numbers. */
function tokens(shape: string): [string, ...number[]] {
  const [op = "", ...numbers] = shape.split(" ")
  return [op, ...numbers.map(Number)]
}

/** Compares two lists item by item; a list sorts before any that it starts. */
function compareSequences(a: readonly number[], b: readonly number[]): number {
  const differs = a.findIndex((n, i) => i < b.length && n !== b[i])
  return differs >= 0 ? a[differs]! - b[differs]! : a.length - b.length
}

/** A text's code points. */
function codePoints(text: string): number[] {
  return [...text].map((c) => c.codePointAt(0)!)
}
