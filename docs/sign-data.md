# Sign data

What Wedges knows about each sign, apart from its skeletons: names, values, Oracc ids, how compounds are built, variants, and sequences of signs with their own readings. It all comes from the [Oracc Sign List](https://oracc.museum.upenn.edu/osl/) (OSL), which is released under CC0.

## Where it comes from

`data/osl.asl` is a copy of OSL's source file, [`00lib/osl.asl`](https://github.com/oracc/osl/blob/master/00lib/osl.asl) in github.com/oracc/osl. The sign data is built from it whenever the app is built or tested: [`scripts/osl/vitePlugin.ts`](../scripts/osl/vitePlugin.ts) parses it and serves the result as the module `virtual:osl`, and scripts and test helpers call `loadOsl()` from [`scripts/osl/loadOsl.ts`](../scripts/osl/loadOsl.ts). `test/data/osl.test.ts` checks the result.

To update the data, copy the latest `osl.asl` over `data/osl.asl`, run `npm run osl-summary` and compare its counts with the ones below, and run `npm run check`. Git history records which version of the file the app was built from, so the counts for an older version can be had by running the script on that version.

## Signs

One entry per Unicode cuneiform character (U+12000–U+1254F) that OSL lists, in code point order:

```json
{
  "char": "𒂼",
  "name": "|GA₂×AN|",
  "unicodeName": "CUNEIFORM SIGN GA2 TIMES AN",
  "oslId": "o0001286",
  "values": ["ama", "…"],
  "compound": { "operator": "×", "parts": ["𒂷", "𒀭"] }
}
```

| Field         | Meaning                                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `char`        | the character                                                                                                           |
| `name`        | the OSL name, such as `AN`, `LAGAR@g` or `\|GA₂×AN\|`                                                                   |
| `unicodeName` | the character's Unicode name, as OSL gives it                                                                           |
| `oslId`       | the id of the OSL page, `https://oracc.museum.upenn.edu/osl/<oslId>`                                                    |
| `values`      | readings, in OSL order, as OSL's pages show them: without a trailing `?` (uncertain) or a language tag (`%akk`)         |
| `formOf`      | when OSL lists the character as a form of another sign, rather than as a sign: that sign's name. The page is the sign's |
| `compound`    | for a compound of encoded signs: the operator and the parts' characters (below)                                         |
| `variant`     | for a variant of an encoded sign: the base sign's character and the modifier (below)                                    |
| `deprecated`  | OSL deprecates the sign. It is kept only so its character has a name; deprecated values are still left out              |

How a character's entry is chosen: a sign before a form, and a current entry before a deprecated one. Deprecated forms and values (`@form-`, `@v-`) are skipped, and so are entries that exist only as parts of compounds (`@compoundonly`). One sign is encoded twice in Unicode (`@unote double-encoded as x1243A`); both characters get the entry, but only the first gets its Unicode name.

### Compounds

A compound's OSL name spells its parts: `|GA₂×AN|` is AN written inside GA₂. `compound` is recorded when the top level of the name uses one operator, once or more, and every part is an encoded sign. A part in parentheses, such as `(U.U.U)` in `|AB×(U.U.U)|`, counts as one part if it is itself an encoded sign. Names that mix operators at the top level, such as `|AB×(U.U.U).KU₃|`, get no `compound`.

| Field      | Meaning                                           |
| ---------- | ------------------------------------------------- |
| `operator` | how the parts combine, from the table below       |
| `parts`    | the parts' characters, two or more, in name order |

| Operator | Meaning                                           |
| -------- | ------------------------------------------------- |
| `×`      | the rest inside the first, as in `\|GA₂×DIM×ŠE\|` |
| `&`      | each above the next, as in `\|AŠ&AŠ&AŠ\|`         |
| `%`      | the two crossed                                   |
| `.`, `+` | side by side                                      |

### Variants

A modifier at the end of a sign's name makes a variant: `@g` gunû (extra hatching), `@t` tenû (slanted), `@s` šeššig, `@n` nutillû (unfinished). When the base sign, the name without the modifier, is encoded, `variant` records it: LAGAR@g has `{ "of": "𒇬", "modifier": "g" }`.

| Field      | Meaning                               |
| ---------- | ------------------------------------- |
| `of`       | the base sign's character             |
| `modifier` | `g`, `t`, `s` or `n`, as listed above |

## Sequences

Entries whose characters are two or more signs, with values of their own. These are the readings of sign sequences, such as ensi₂ for PA.TE.SI:

```json
{
  "chars": "𒉺𒋼𒋛",
  "name": "|PA.TE.SI|",
  "oslId": "o0002206",
  "values": ["ensag", "ensi₂", "ensik"]
}
```

The fields mean the same as for signs. Sequences without values are left out.
