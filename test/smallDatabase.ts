import { SignDatabase } from "@/core/signs"

/** Signs of the Oracc Sign List, as the sign database gives them. */
export const PA = "𒉺"
export const TE = "𒋼"
export const SI = "𒋛"
export const ŠA = "𒊭"

/**
 * A sign database with a few real signs, PA, TE, SI and ŠA, and the sequence
 * PA.TE.SI, read ensi₂. None has samples.
 */
export const smallDatabase = new SignDatabase([], {
  signs: [
    {
      char: ŠA,
      name: "ŠA",
      unicodeName: "CUNEIFORM SIGN SHA",
      oslId: "o0002824",
      values: ["ša", "ša₃"],
    },
    {
      char: PA,
      name: "PA",
      unicodeName: "CUNEIFORM SIGN PA",
      oslId: "o0000497",
      values: ["pa", "ugula"],
    },
    {
      char: TE,
      name: "TE",
      unicodeName: "CUNEIFORM SIGN TE",
      oslId: "o0000550",
      values: ["te"],
    },
    {
      char: SI,
      name: "SI",
      unicodeName: "CUNEIFORM SIGN SI",
      oslId: "o0000525",
      values: ["si"],
    },
  ],
  sequences: [
    {
      chars: PA + TE + SI,
      name: "|PA.TE.SI|",
      oslId: "o0002206",
      values: ["ensag", "ensi₂", "ensik"],
    },
  ],
})
