/** Helpers for arrays and maps that the standard library doesn't have yet. */

/**
 * Groups items by a key, in their order, leaving out items that have no key.
 * It stands in for `Map.groupBy`, which is newer than the ES2023 library the
 * TypeScript configs target.
 */
export function groupBy<T>(
  items: readonly T[],
  keyOf: (item: T) => string | undefined,
): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const key = keyOf(item)
    if (key === undefined) continue
    const group = groups.get(key) ?? []
    group.push(item)
    groups.set(key, group)
  }
  return groups
}
