import type { Polygon } from "@/lib/geometry"

/** Polygons as SVG path data, each closed, for a path filled by the nonzero rule. */
export function svgPath(polygons: readonly Polygon[]): string {
  return polygons
    .map((polygon) => {
      const [first, ...rest] = polygon.map((p) => `${round(p.x)} ${round(p.y)}`)
      return first ? `M${first}${rest.map((p) => `L${p}`).join("")}Z` : ""
    })
    .join("")
}

/** Two decimal places are well below a pixel at any size the page draws. */
function round(n: number): number {
  return Math.round(n * 100) / 100
}
