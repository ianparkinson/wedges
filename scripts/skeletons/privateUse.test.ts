import { describe, expect, it } from "vitest"

import { escapePrivateUse } from "./privateUse"

describe("escapePrivateUse", () => {
  it("escapes a private-use character in the Basic Multilingual Plane", () => {
    expect(escapePrivateUse(JSON.stringify({ text: "" }))).toBe(
      '{"text":"\\uE003"}',
    )
  })

  it("escapes one above U+FFFF as a surrogate pair", () => {
    expect(escapePrivateUse(JSON.stringify({ text: "\u{100001}" }))).toBe(
      '{"text":"\\uDBC0\\uDC01"}',
    )
  })

  it("leaves cuneiform as literal characters", () => {
    expect(escapePrivateUse('{"text":"𒀀"}')).toBe('{"text":"𒀀"}')
  })
})
