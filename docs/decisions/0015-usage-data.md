# 0015: Value usage counted from Oracc's glossaries

- **Date:** 18 November 2026
- **Status:** accepted

## Context

Many signs have dozens of values, which OSL lists alphabetically, so users can't tell whether the sign they matched is the one they meant (issue #79, discussion #78). Oracc's lemmatised corpora count how often each spelling of each word occurs, which gives each value's frequency in each language, and the words it writes.

## Decision

- **Counts come from the glossaries in every public Oracc project's JSON zip**, not from a chosen list of projects. Akkadian has no combined glossary, and the projects overlap so much that each word is counted once, by its place in its text. Taking every project then costs nothing in double counting and misses nothing.
- **Sumerian and Akkadian only.** Urartian is the only other cuneiform language with real data on Oracc, and too little to be worth a section. Names count under their text's main language.
- **One committed file per language, keyed by value**, in `data/usage/`. The build joins it to `osl.asl`, so an OSL update needs no new usage data, and the files are reviewed as a diff in each update.
- **A monthly workflow opens a pull request** with the rebuilt files, from the `update-usage` branch, using the Wedges updates app as [0014](0014-update-osl.md) does. Oracc's glossaries change far less often than `osl.asl`. No file records the date: git does.
- **The missing intermediate certificate is fetched on each run** from the address in Oracc's certificate, and checked against the runner's trusted roots, rather than stored in the repo, where it would need replacing when Oracc renews.
- The script reads glossaries with the `stream-json` package and zips with `unzip`, so the 2 GB ePSD2 glossary never has to fit in memory.

## Revisit when

Oracc publishes a combined Akkadian glossary or frequency list; Oracc's server starts sending its full certificate chain, when the certificate step can go; or a run takes long enough to approach the job's 60-minute limit.
