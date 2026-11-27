import { parseShape } from "@/core/skeleton"

/** Shapes typed one to a line, as far as they can be read. */
export interface DraftShapes {
  /** The lines that are shapes, with single spaces. */
  readonly shapes: readonly string[]
  /** A message for each line that isn't a shape, such as "Line 2: w 1 2". */
  readonly problems: readonly string[]
}

/** Reads shapes typed one to a line, skipping blank lines. */
export function draftShapes(text: string): DraftShapes {
  const shapes: string[] = []
  const problems: string[] = []
  text.split("\n").forEach((line, i) => {
    const shape = line.trim().split(/\s+/).join(" ")
    if (!shape) return
    if (isShape(shape)) {
      shapes.push(shape)
    } else {
      problems.push(`Line ${i + 1}: ${shape}`)
    }
  })
  return { shapes, problems }
}

function isShape(text: string): boolean {
  try {
    parseShape(text)
    return true
  } catch {
    return false
  }
}
