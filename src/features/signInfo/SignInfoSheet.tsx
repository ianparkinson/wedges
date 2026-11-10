import type { SignDatabase, SignListEntry } from "@/core/signs"
import { Sheet } from "@/ui/Sheet/Sheet"

import { SignInfo } from "./SignInfo"

/** Props for {@link SignInfoSheet}. */
export interface SignInfoSheetProps {
  /** The sign or sequence to show, or undefined to show none. */
  about: SignListEntry | undefined
  signDatabase: SignDatabase
  onClose: () => void
  /** Adds the characters to the text; leave it out when they are already there. The sheet closes after. */
  onAppend?: () => void
}

/** A sign or sequence's {@link SignInfo} in a sheet of its own, headed by its name. */
export function SignInfoSheet({
  about,
  signDatabase,
  onClose,
  onAppend,
}: SignInfoSheetProps) {
  return (
    <Sheet
      isOpen={about !== undefined}
      onClose={onClose}
      title={about?.name ?? ""}
    >
      {about && (
        <SignInfo
          about={about}
          signDatabase={signDatabase}
          {...(onAppend && {
            onAppend: () => {
              onAppend()
              onClose()
            },
          })}
        />
      )}
    </Sheet>
  )
}
