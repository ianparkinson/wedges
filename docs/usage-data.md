# Usage data

How often each sign value is used in Sumerian and in Akkadian, and which words it writes, counted from the glossaries of Oracc's lemmatised corpora. Many signs have dozens of values, and OSL lists them alphabetically, so users can't tell which reading is the usual one. These counts order them.

The data is in `data/usage/`, one file per language, named by Oracc's language code: `sux.json` for Sumerian, `akk.json` for Akkadian. Each maps a value to how often it's used and the words it writes, most common first:

```json
"du₃": {
  "n": 17252,
  "words": [{ "cf": "du", "gw": "build", "pos": "V/t", "n": 5967 }]
}
```

`cf` is the word's citation form, `gw` its English guide word and `pos` Oracc's part-of-speech tag. The files are keyed by value, not by sign, so an OSL update needs no new usage data. `data/schemas/usage.schema.json` describes them, and `test/data/usage.test.ts` checks them against it.

## Where it comes from

Every public Oracc project publishes its data as a JSON zip at `https://oracc.museum.upenn.edu/json/<project>.zip`, released under CC0. A lemmatised project's zip has a glossary per language, such as `gloss-sux.json` and `gloss-akk.json`, and one of names, `gloss-qpn.json`. Each glossary lists its words, every spelling of each word, and every place in a text where each spelling occurs.

- **Sumerian** comes almost entirely from ePSD2's glossary, which gathers Oracc's Sumerian corpora.
- **Akkadian** has no combined glossary, so every project's Akkadian glossaries are counted, including the per-dialect ones such as `gloss-akk-x-oldbab.json`.
- **Names** count under the language that most of the other words in their text are in.

The projects overlap heavily, since umbrella projects repeat their subprojects' texts. A word is counted once however many glossaries list it, keyed by its place in a text, such as `P282615.88.1`. P and Q numbers are the same in every project; X numbers belong to one project, so they keep the project's name.

## How it's counted

[`scripts/usage/`](../scripts/usage/) streams each glossary, since ePSD2's is nearly 2 GB.

1. **Split each spelling into its values.** `{ŋeš}a₂-ni` is `ŋeš`, `a₂`, `ni`. Determinatives count. Numbers, unread signs, compounds written by name (`|A.AN|`) and notes after a `\` are left out. Logograms, written in upper case, are lower-cased, and a qualified value keeps its qualifier, as in `kuₓ(DU)`.
2. **Count each value** once for each occurrence of the spelling.
3. **Attach the word when the value writes it,** rather than only spelling a sound or an affix. In Sumerian, that's when the value alone, perhaps repeated, makes up one of the word's stems: du₃ writes du "build" in `mu-un-du₃`, but un doesn't. In Akkadian, it's when the value is written as a logogram: `DU₃` writes epēšu "do". Each value lists every word it writes, most common first; the app chooses how many to show.

Some of Oracc's glossary files are cut short. The script checks that each file ends where its JSON does, and skips and names in the update's pull request any that don't, rather than count part of one. A glossary that still fails to parse stops the run.

## How the app uses it

When the app is built, [`scripts/usage/orderValues.ts`](../scripts/usage/orderValues.ts) lists each sign's values in order of use too, as `valuesByUse`, so the suggestion chips can show the common readings first. The sign info panel keeps OSL's order. A value's place comes from its share of the sign's uses in Sumerian plus its share in Akkadian, so a reading common in either language comes early; the Sumerian share breaks a tie, and values neither glossary counts follow in OSL's order. The sign data also carries how often each value is used in both languages together, which look-up uses to rank equally good matches ([lookup.md](lookup.md)). Without the files in `data/usage/`, values keep OSL's order.

The sign info panel shows each sign's common values in Sumerian and in Akkadian, with the words they write. [`scripts/usage/commonValues.ts`](../scripts/usage/commonValues.ts) picks them when the app is built and serves them as `virtual:usage`, which loads with the rest of the sign data after the first paint. A value is left out when it makes up under 1% of the sign's uses in that language or is used fewer than 10 times. A word is shown when it makes up at least 5% of the value's uses, up to three per value. Parts of speech are spelled out, as in "transitive verb", and a name shows its kind, as in "god", since its guide word is only a number that tells apart names spelled alike.

## Keeping it up to date

`.github/workflows/update-usage.yml` runs [`scripts/updateUsage.sh`](../scripts/updateUsage.sh) monthly, and by hand from the Actions tab, and opens a pull request when the counts change ([0015](decisions/0015-usage-data.md)). The script downloads every public project's zip (about 2 GB) and runs `npm run build-usage` on them, which takes about a quarter of an hour. It can be run by hand too.

Oracc's server doesn't send the intermediate certificate that signed its own, so curl can't verify it. The script downloads that intermediate from the address in the server's certificate, as browsers do, and checks it against the system's trusted roots before using it.
