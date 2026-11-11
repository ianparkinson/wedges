# 0011: Back closes the open sheet

- **Date:** 11 November 2026
- **Status:** accepted

## Context

On a phone, the Look up and sign info sheets fill the screen, so they look like pages, and people use the browser's back button or gesture to leave them: the back swipe on Android, or the swipe in from the left edge in iPhone Safari. The app had no history entries of its own, so back left Wedges altogether, which is the thing to prevent.

## Decision

While a sheet is open there is one session history entry for it, with the app's own URL, and back closes the sheet straight to the main screen, from any view inside it: back from a Look up entry closes Look up, not just the entry. A sheet closed some other way, by Close, Escape, a tap outside or appending a sign, pops its entry, so that the next back doesn't seem to do nothing. `Sheet` does this itself, through `useBackToClose`, so every sheet gets it.

A stack of entries, one per view, so that back steps from an entry to the results, was built first and dropped: it was more code to maintain than the stepping was worth. A router, with a URL for each sheet, was not chosen either: the sheets don't need addresses of their own.

## Revisit when

Views inside a sheet get deep enough, for example with links from sign to sign, that people expect back to retrace them; or a sheet or sign should have a URL that can be shared or bookmarked, which calls for real routes.
