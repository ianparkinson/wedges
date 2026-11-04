import { osl } from "virtual:osl"

import { SignDatabase } from "@/core/signs"

import noto from "../data/skeletons/noto.json"

/** The real sign database, as the app builds it. */
export function signDatabase(): SignDatabase {
  return new SignDatabase([noto as typeof noto & { version: 1 }], osl)
}
