/**
 * Reads the parts of a compound sign from its OSL name, such as |GA₂×AN|.
 */
// The Vite config loads this file in plain Node, which knows no @/ alias.
import {
  COMPOUND_OPERATORS,
  type CompoundOperator,
} from "../../src/core/types.ts"

/** A compound sign's name split into its operator and parts. */
export interface CompoundName {
  readonly operator: CompoundOperator
  /**
   * Two or more parts, in the order the name gives them: for ×, the outer
   * part, then the inner.
   */
  readonly parts: readonly string[]
}

/**
 * Splits a compound name whose top level has one operator, used once or
 * more, such as |GA₂×AN|, |A×(U.U)| or |AŠ&AŠ&AŠ|. Returns null for anything
 * else, such as |AB×(U.U.U).KU₃|, whose operators differ.
 */
export function splitCompound(name: string): CompoundName | null {
  if (!name.startsWith("|") || !name.endsWith("|")) return null
  const parts = splitTopLevel(name.slice(1, -1))
  const operators = new Set(parts.operators)
  const [operator] = operators
  if (operators.size !== 1 || !operator) return null
  const unwrapped = parts.parts.map(unwrap)
  return unwrapped.every(Boolean) ? { operator, parts: unwrapped } : null
}

/** Splits `body` at each operator outside parentheses. */
function splitTopLevel(body: string): {
  parts: string[]
  operators: CompoundOperator[]
} {
  const parts: string[] = []
  const operators: CompoundOperator[] = []
  let depth = 0
  let start = 0

  for (let i = 0; i < body.length; i++) {
    const c = body[i]!
    if (c === "(") depth++
    else if (c === ")") depth--
    else if (depth === 0 && isOperator(c)) {
      parts.push(body.slice(start, i))
      operators.push(c)
      start = i + 1
    }
  }

  parts.push(body.slice(start))
  return { parts, operators }
}

function isOperator(c: string): c is CompoundOperator {
  return (COMPOUND_OPERATORS as readonly string[]).includes(c)
}

/** Removes one pair of parentheses around the whole of `part`, and wraps an inner compound in bars. */
function unwrap(part: string): string {
  const inner =
    part.startsWith("(") && part.endsWith(")") ? part.slice(1, -1) : part
  return COMPOUND_OPERATORS.some((op) => inner.includes(op))
    ? `|${inner}|`
    : inner
}
