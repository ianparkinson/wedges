/**
 * Renders the icon a phone shows when the app is added to its home screen,
 * from the favicon.
 */
import { Resvg, type RenderedImage } from "@resvg/resvg-js"

/** The size Apple asks for on current iPhones, in pixels. */
export const TOUCH_ICON_SIZE = 180

/**
 * Renders the favicon's SVG as a square touch icon, TOUCH_ICON_SIZE pixels
 * across. The SVG's rounded corners are squared off, because iOS rounds
 * the corners itself.
 */
export function renderTouchIcon(faviconSvg: string): RenderedImage {
  const square = faviconSvg.replace(/ rx="[^"]*"/, "")
  return new Resvg(square, {
    fitTo: { mode: "width", value: TOUCH_ICON_SIZE },
  }).render()
}
