# 0004: Layers with one-way dependencies

- **Date:** 3 November 2026, updated 10 November 2026 for `lib` ([0010](0010-lib-layer.md))
- **Status:** accepted

## Context

The recognition code should stay usable outside this app, for example by a future tracing app. UI code should not grow tangled with it.

## Decision

The code splits into `src/core`, `src/ui` and `src/features`, with `src/app` putting them together:

- `lib` holds pure TypeScript helpers that know nothing of the app, such as geometry. It imports nothing of ours, and anything may import it.
- `core` is pure TypeScript and imports nothing outside itself and `lib`: no React, no DOM.
- `ui` is presentation only and imports neither `core` nor `features`.
- `features` use `ui` and `core`. `app` uses everything.

This is enforced by tools, not convention: `no-restricted-imports` rules in `eslint.config.js`, and a separate `tsconfig.core.json` that leaves the DOM out of `lib`.

## Consequences

When the tracing app starts, `core/`, `lib/` and `data/` can move into a shared package in an npm workspace without untangling anything. Until then a single app is simpler.

## Revisit when

A second app needs `core` (move it to a workspace package).
