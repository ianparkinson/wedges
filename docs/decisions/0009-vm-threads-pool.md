# 0009: Run unit tests in Vitest's `vmThreads` pool

- **Date:** 7 November 2026
- **Status:** accepted

## Context

Every test file runs in jsdom, and Vitest's default pool builds a new jsdom for each file. With 42 files that was half of the run: `npm test` took about 15 seconds, and Vitest warned about it. It suggests two fixes. `pool: "vmThreads"` builds jsdom once per worker and runs each file in its own VM context, so files stay isolated. `isolate: false` shares one environment and one module graph across files, so state left by one file can leak into the next. A third option is to run the files that don't touch the DOM in the `node` environment, which needs a comment in each of them or a second Vitest project, and only helps those files.

## Decision

Use `pool: "vmThreads"`. It is one line, keeps each file isolated, and took the run from about 15 seconds to about 5. `isolate: false` was faster still, under 4 seconds, but not worth tests that can depend on each other.

## Revisit when

A test fails only under `vmThreads`. VM contexts have known rough edges: built-in globals differ between contexts, so an `instanceof` check against something from Node can fail, and memory can grow on large suites (`vmMemoryLimit` caps it). Switching back to the default `forks` pool is removing the line.
