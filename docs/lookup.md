# Lookup

How a typed query finds signs and sign sequences by name or value. The implementation is [`src/core/lookup.ts`](../src/core/lookup.ts); the names and values come from the Oracc Sign List data ([sign-data.md](sign-data.md)), through `SignDatabase.lookupEntries` in [`src/core/signs.ts`](../src/core/signs.ts).

## What can be searched

Each entry is a sign (one character) or a sequence (several characters with readings of their own, such as PA.TE.SI, read ensi₂). Its keys are its OSL name, its Unicode name without the common prefix (CUNEIFORM SIGN GA2 TIMES AN is `GA2 TIMES AN`, and CUNEIFORM NUMERIC SIGN and CUNEIFORM PUNCTUATION SIGN are dropped too) when that differs from the OSL name, and its values. Unicode names count as names in the ranking. `buildIndex()` folds every key once; `search(index, query, limit)` returns the best `limit` entries (40 by default), each with the key that matched.

Two kinds of query skip the keys:

- **Cuneiform characters,** typed or pasted: the signs for each character, in order and without repeats. When the characters spell a sequence, the sequence comes first.
- **A code point,** such as `U+1202D` or `1202D`: that sign, if the data has it.

## Folding

Names and values are compared after folding both sides to plain lowercase ASCII, so a query can be typed on any keyboard:

| Written                 | Folds to                            |
| ----------------------- | ----------------------------------- |
| š ṣ ś                   | s, also typed sh, sz or s,          |
| ṭ, ḫ                    | t and h, also typed t, and h, or ch |
| ŋ ĝ                     | g, or typed ng                      |
| ₀–₉, ₓ                  | 0–9, x                              |
| ×                       | x                                   |
| accented vowels         | the plain vowel                     |
| ʾ ' ’ ⁻ \| . and spaces | dropped                             |

So `sza`, `sha` and `ša` all find ŠA, `a2` finds a₂, and `ga2xan` finds |GA₂×AN|. A name or value with ŋ or ĝ is indexed twice, once with g and once with ng, so `digir` and `dingir` both find diŋir. OSL writes ḫ as plain h, so `chi` finds HI. A value spelled with ng still comes first for an ng query, through the exact-spelling tie-break below.

## Ranking

Each entry is scored by its best key. Keys are matched in tiers, best first:

1. **Exact:** the folded key is the query.
2. **Index:** the key is the query plus an index, for a query that doesn't end in a digit: `dingir` finds dingir₂, and `sag` finds sagₓ.
3. **Prefix:** the key starts with the query.
4. **Contains:** the key contains the query, for queries of three letters or more.

Within a tier, results are ordered by:

1. **Exact spelling:** a key that also matches before folding away š, ṣ, ṭ and ḫ (with sh and sz read as š) comes first, so `sha` finds ŠA before SA, while `sa` finds SA before ŠA.
2. Names before values.
3. Shorter keys.
4. Signs before sequences.
5. Code point order.

## Tests

- `src/core/lookup.test.ts`: folding, each tier and tie-break, code points and pasted characters, on a handful of entries.
- `test/lookup.test.ts`: about 30 queries on the real data, each with the sign or sequence that should come first and why: ASCII stand-ins for š, ṣ, ṭ, ḫ and ŋ, values, modified and compound signs, sequences, code points and pasted characters.
