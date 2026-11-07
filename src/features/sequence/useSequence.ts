import { useSessionStorage } from "usehooks-ts"

import {
  editSequence,
  EMPTY_SEQUENCE,
  restoreSequence,
  type SequenceAction,
  type SequenceState,
} from "@/core/sequence"

/** Where the sequence is saved in session storage. */
const STORAGE_KEY = "wedges:sequence"

const storageOptions = {
  deserializer: (raw: string) => restoreSequence(JSON.parse(raw)),
}

/**
 * The sequence being written, and a function to apply actions to it. The
 * sequence is saved in session storage after every action, so it survives a
 * reload, or a phone discarding the tab while another app is in front. It is
 * gone once the tab is closed.
 */
export function useSequence(): [
  SequenceState,
  (action: SequenceAction) => void,
] {
  const [sequence, setSequence] = useSessionStorage(
    STORAGE_KEY,
    EMPTY_SEQUENCE,
    storageOptions,
  )
  const dispatch = (action: SequenceAction) =>
    setSequence((current) => editSequence(current, action))
  return [sequence, dispatch]
}
