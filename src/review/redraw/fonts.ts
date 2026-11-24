/**
 * The font behind each skeleton file, and how it draws its strokes.
 */
import type { StrokeStyle } from "./impression"

/** The font a skeleton file describes. */
export interface SkeletonFont {
  /** The font file, in `data/fonts/`. */
  readonly path: string
  readonly style: StrokeStyle
}

/** Noto Sans Cuneiform, measured from its glyphs. */
const NOTO: SkeletonFont = {
  path: "noto/NotoSansCuneiform-Regular.ttf",
  style: { tailEnd: 2.6, taper: 2, legWidth: 0.16 },
}

/** The font for each skeleton file in `data/skeletons/`, by the file's name. */
export const skeletonFonts: Readonly<Record<string, SkeletonFont>> = {
  noto: NOTO,
  "noto-next": NOTO,
}
