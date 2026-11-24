import { useCallback, useState } from "react"

/**
 * A string kept in the page's URL query, as `name=value`, so that a reload
 * comes back to the same view. The default value is left out of the URL.
 */
export function useUrlState(
  name: string,
  defaultValue: string,
): [string, (value: string) => void] {
  const [value, setValue] = useState(
    () => new URLSearchParams(location.search).get(name) ?? defaultValue,
  )

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
