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

  it("numbers each shape when asked", () => {
    const { container } = render(<SkeletonPicture {...props} numbered />)
    expect(
      [...container.querySelectorAll("text")].map((t) => t.textContent),
    ).toEqual(["1", "2"])
  })

  it("draws a version to compare with over the top", () => {
    const { container } = render(
      <SkeletonPicture
        {...props}
        before={{
          shapes: ["w 22 70 270 60 4"],
          winkelhakenAngle: 100,
          style: props.style,
          font: testFont(80),
        }}
      />,
    )
    expect(container.querySelectorAll("path")).toHaveLength(5)
  })
})
