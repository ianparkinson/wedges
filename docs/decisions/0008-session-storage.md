# 0008: Keep the text in session storage only

- **Date:** 7 November 2026
- **Status:** accepted

## Context

Phone browsers often discard a tab that is in the background to free memory, and reload it when it comes back. Copying the text and switching to another app to paste it is exactly when that happens, so text held only in memory can be lost on the way. The app otherwise keeps no state on the device: no cookies, no local storage, no accounts.

## Decision

Save the sequence, its signs and its cursor, in `sessionStorage` after every edit. It survives a reload, or the tab being discarded and restored, and is gone when the tab is closed. Nothing outlasts the tab, and nothing is sent anywhere. Saved data that isn't a sequence, as from an older version of the app, gives an empty one.

## Revisit when

People want their text back after closing the tab, in which case `localStorage` is the same change with a longer life.
