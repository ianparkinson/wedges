import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { testFont } from "@test/testFont"

import { SkeletonPicture } from "./SkeletonPicture"

const props = {
  text: "𒁹",
  shapes: ["w 22 70 270 70 4", "k 40 40 0 10"],
  font: testFont(),
  winkelhakenAngle: 100,
  style: { tailEnd: 2, taper: 2, legWidth: 0.2 },
}

describe("SkeletonPicture", () => {
  it("draws the glyph and a path for each shape", () => {
    const { container } = render(<SkeletonPicture {...props} />)
    expect(container.querySelectorAll("path")).toHaveLength(3)
  })
})
