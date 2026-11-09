import { SignDatabase } from "@/core/signs"

/** Signs of the Oracc Sign List, as the sign database gives them. */
export const PA = "𒉺"
export const TE = "𒋼"
export const SI = "𒋛"
export const ŠA = "𒊭"
export const AN = "𒀭"
export const GA2 = "𒂷"
export const GA2_TIMES_AN = "𒂼"
export const LAGAR = "𒇬"
export const LAGAR_GUNU = "𒇯"

/**
 * A sign database with a few real signs, PA, TE, SI and ŠA, the sequence
 * PA.TE.SI, read ensi₂, the compound |GA₂×AN| with its parts, and LAGAR with
 * its variant LAGAR@g. None has samples.
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
    {
      char: AN,
      name: "AN",
      unicodeName: "CUNEIFORM SIGN AN",
      oslId: "o0000099",
      values: ["an", "dingir"],
    },
    {
      char: GA2,
      name: "GA₂",
      unicodeName: "CUNEIFORM SIGN GA2",
      oslId: "o0000206",
      values: ["ga₂"],
    },
    {
      char: GA2_TIMES_AN,
      name: "|GA₂×AN|",
      unicodeName: "CUNEIFORM SIGN GA2 TIMES AN",
      oslId: "o0001286",
      values: ["ama", "dagal"],
      compound: { operator: "×", parts: [GA2, AN] },
    },
    {
      char: LAGAR,
      name: "LAGAR",
      unicodeName: "CUNEIFORM SIGN LAGAR",
      oslId: "o0000307",
      values: ["lagal", "lagar", "nagal"],
    },
    {
      char: LAGAR_GUNU,
      name: "LAGAR@g",
      unicodeName: "CUNEIFORM SIGN LAGAR GUNU",
      oslId: "o0000308",
      values: ["du₆", "dul₆"],
      variant: { of: LAGAR, modifier: "g" },
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
