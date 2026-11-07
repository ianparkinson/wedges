import { describe, expect, it } from "vitest"

import { PA, ŠA, SI, smallDatabase, TE } from "../../../test/smallDatabase"
import {
  entryChars,
  entryName,
  entryValues,
  findSignListEntry,
} from "./signListEntry"

describe("findSignListEntry", () => {
  it("finds a sign, with its name and character", () => {
    const entry = findSignListEntry(smallDatabase, { kind: "sign", chars: ŠA })!
    expect(entryName(entry)).toBe("ŠA")
    expect(entryChars(entry)).toBe(ŠA)
    expect(entryValues(entry)).toEqual(["ša", "ša₃"])
  })

  it("finds a sequence, with its name and characters", () => {
    const entry = findSignListEntry(smallDatabase, {
      kind: "sequence",
      chars: PA + TE + SI,
    })!
    expect(entryName(entry)).toBe("|PA.TE.SI|")
    expect(entryChars(entry)).toBe(PA + TE + SI)
    expect(entryValues(entry)).toEqual(["ensag", "ensi₂", "ensik"])
  })

  it("finds nothing for a character the database doesn't know", () => {
    expect(findSignListEntry(smallDatabase, { kind: "sign", chars: "𒀀" })).toBe(
      undefined,
    )
  })
})
