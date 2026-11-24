import { useCallback, useState } from "react"

/**
 * A string kept in the page's URL query, as `name=value`, so that a reload
 * comes back to the same view. The default value is left out of the URL.
 *
 * Given `options`, the value is always one of them: a value in the URL that
 * isn't, such as from an old link, reads as the default.
 */
export function useUrlState(
  name: string,
  defaultValue: string,
): [string, (value: string) => void]
export function useUrlState<T extends string>(
  name: string,
  defaultValue: T,
  options: readonly T[],
): [T, (value: T) => void]
export function useUrlState(
  name: string,
  defaultValue: string,
  options?: readonly string[],
): [string, (value: string) => void] {
  const [value, setValue] = useState(() => {
    const fromUrl = new URLSearchParams(location.search).get(name)
    return fromUrl !== null && (!options || options.includes(fromUrl))
      ? fromUrl
      : defaultValue
  })

  const update = useCallback(
    (next: string) => {
      const params = new URLSearchParams(location.search)
      if (next === defaultValue) params.delete(name)
      else params.set(name, next)
      const query = params.toString()
      history.replaceState(null, "", query ? `?${query}` : location.pathname)
      setValue(next)
    },
    [name, defaultValue],
  )
  return [value, update]
}
