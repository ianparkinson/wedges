import { prepareSample } from "@/core/matcher/match"
import { parseSpec } from "@/core/spec"

import noto from "../data/skeletons/noto.json"

/** The Noto skeletons, one prepared sample per sign, in file order. */
export function skeletonSigns() {
  return noto.skeletons.map(({ char, spec }) => {
    const strokes = parseSpec(spec)
    return { char, strokes, samples: [prepareSample(strokes)] }
  })
}
