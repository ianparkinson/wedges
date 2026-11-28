/**
 * Whether a key pressed anywhere on the review page is for one of the
 * page's own single-key shortcuts. Keys typed into a field or list are for
 * it, though a checkbox takes no letters, and a key held with Ctrl, Cmd or
 * Alt is for the browser, as Ctrl+R reloads.
 */
export function isPageKey(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false
  const target = event.target
  return !(
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLInputElement && target.type !== "checkbox")
  )
}
