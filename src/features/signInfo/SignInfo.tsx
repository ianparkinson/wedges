import { codePoint, oslUrl, type SignDatabase } from "@/core/signs"
import { Button } from "@/ui/Button/Button"
import { Link } from "@/ui/Link/Link"

import styles from "./SignInfo.module.css"
import { entryChars, entryName, type SignListEntry } from "./signListEntry"

/** Props for {@link SignInfo}. */
export interface SignInfoProps {
  entry: SignListEntry
  /** Names the signs a sequence is made of. */
  database: SignDatabase
  /** Adds the entry's characters to the text; leave it out when they are already there. */
  onAppend?: () => void
}

/**
 * What the Oracc Sign List says about a sign or a sequence: its characters,
 * values and code points, and a link to its page there. Append, when
 * offered, adds its characters to the text, a sequence's as one sign each.
 */
export function SignInfo({ entry, database, onAppend }: SignInfoProps) {
  const chars = entryChars(entry)
  const { values, formOf, oslId } =
    entry.kind === "sign" ? entry.sign : entry.sequence

  return (
    <div className={styles.panel}>
      <p className={styles.glyphs} aria-hidden="true">
        {chars}
      </p>
      {onAppend && (
        <Button onPress={onAppend} isProminent>
          {entry.kind === "sign" ? "Append" : "Append all"}
        </Button>
      )}
      <dl className={styles.facts}>
        {values.length > 0 && (
          <>
            <dt>Values</dt>
            <dd>{values.join(", ")}</dd>
          </>
        )}
        {formOf && (
          <>
            <dt>A form of</dt>
            <dd>{formOf}</dd>
          </>
        )}
        {entry.kind === "sign" ? (
          <>
            <dt>Unicode</dt>
            <dd>{`${codePoint(chars)} ${entry.sign.unicodeName ?? ""}`}</dd>
          </>
        ) : (
          <>
            <dt>Signs</dt>
            <dd>
              <ul className={styles.signs}>
                {[...chars].map((char, i) => (
                  <li key={i}>
                    <span className={styles.sign} aria-hidden="true">
                      {char}
                    </span>{" "}
                    {database.sign(char)?.name} {codePoint(char)}
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>
      <p className={styles.link}>
        <Link href={oslUrl({ oslId })}>
          {entryName(entry)} in the Oracc Sign List
        </Link>
      </p>
    </div>
  )
}
