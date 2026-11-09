import { Fragment } from "react"

import {
  codePoint,
  modifierName,
  oslUrl,
  type Sign,
  type SignDatabase,
} from "@/core/signs"
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
 * values and code points, the parts of a compound, how a sign and its
 * variants are related, and a link to its page there. Append, when
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
          <SignFacts sign={entry.sign} database={database} />
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

/**
 * The facts about a sign alone: the parts of a compound, the sign a variant
 * is a variant of, the sign's own variants, and its code point.
 */
function SignFacts({ sign, database }: { sign: Sign; database: SignDatabase }) {
  const { compound, variant } = sign
  const variants = database.variants(sign.char)
  const nameOf = (char: string) => (
    <>
      <span className={styles.sign}>{char}</span> {database.sign(char)?.name}
    </>
  )

  return (
    <>
      {compound && (
        <>
          <dt>Parts</dt>
          <dd>
            {compound.parts.map((part, i) => (
              <Fragment key={i}>
                {i > 0 && ` ${compound.operator} `}
                {nameOf(part)}
              </Fragment>
            ))}
          </dd>
        </>
      )}
      {variant && (
        <>
          <dt>Variant of</dt>
          <dd>
            {nameOf(variant.of)}, {modifierName(variant.modifier)}
          </dd>
        </>
      )}
      {variants.length > 0 && (
        <>
          <dt>Variants</dt>
          <dd>
            <ul className={styles.signs}>
              {variants.map((v) => (
                <li key={v.char}>
                  {nameOf(v.char)}
                  {v.variant && `, ${modifierName(v.variant.modifier)}`}
                </li>
              ))}
            </ul>
          </dd>
        </>
      )}
      <dt>Unicode</dt>
      <dd>{`${codePoint(sign.char)} ${sign.unicodeName ?? ""}`}</dd>
    </>
  )
}
