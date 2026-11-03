# 0004: Three layers with one-way dependencies

- **Date:** 3 November 2026
- **Status:** accepted

## Context

The recognition code should stay usable outside this app: by a future tracing app, and perhaps a native keyboard. UI code should not grow tangled with it, as it did in the prototype's `app.js`.

## Decision

The code splits into `src/core`, `src/ui` and `src/features`, with `src/app` putting them together:

- `core` is pure TypeScript and imports nothing outside itself: no React, no DOM.
- `ui` is presentation only and imports neither `core` nor `features`.
- `features` use `ui` and `core`. `app` uses everything.

This is enforced by tools, not convention: `no-restricted-imports` rules in `eslint.config.js`, and a separate `tsconfig.core.json` that leaves the DOM out of `lib`.

## Consequences

When the tracing app starts, `core/` and `data/` can move into a shared package in an npm workspace without untangling anything. Until then a single app is simpler.

## Revisit when

A second app needs `core` (move it to a workspace package).
