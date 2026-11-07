import type { SignDatabase } from "@/core/signs"
import { Sheet } from "@/ui/Sheet/Sheet"

import { SignInfo } from "./SignInfo"
import { entryName, type SignListEntry } from "./signListEntry"

/** Props for {@link SignInfoSheet}. */
export interface SignInfoSheetProps {
  /** The entry to show, or undefined to show none. */
  entry: SignListEntry | undefined
  database: SignDatabase
  onClose: () => void
  /** Adds the entry's characters to the text; leave it out when they are already there. The sheet closes after. */
  onAppend?: () => void
}

/** An entry in a sheet of its own, headed by its name. */
export function SignInfoSheet({
  entry,
  database,
  onClose,
  onAppend,
}: SignInfoSheetProps) {
  return (
    <Sheet
      isOpen={entry !== undefined}
      onClose={onClose}
      title={entry ? entryName(entry) : ""}
    >
      {entry && (
        <SignInfo
          entry={entry}
          database={database}
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
