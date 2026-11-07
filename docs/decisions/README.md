# Decision records

One short file per decision that someone might later want to revisit: what was decided, why, and when to look at it again. Number them in order. When a decision changes, update its record in place and give the date of the change; git history keeps the earlier version.

| #                                      | Decision                                         | Status   |
| -------------------------------------- | ------------------------------------------------ | -------- |
| [0001](0001-stack.md)                  | TypeScript, Vite, React and CSS Modules          | accepted |
| [0002](0002-react-aria.md)             | React Aria Components behind our own `ui/` layer | accepted |
| [0003](0003-json-data.md)              | Sign data as versioned JSON, not code            | accepted |
| [0004](0004-layers.md)                 | Three layers with one-way dependencies           | accepted |
| [0005](0005-hosting-ci.md)             | GitHub Pages hosting; accuracy benchmark in CI   | accepted |
| [0006](0006-ranking-on-main-thread.md) | Rank on the main thread, without a Web Worker    | accepted |
| [0007](0007-bundled-cuneiform-font.md) | Bundle Noto Sans Cuneiform                       | accepted |
| [0008](0008-session-storage.md)        | Keep the text in session storage only            | accepted |
| [0009](0009-vm-threads-pool.md)        | Run unit tests in Vitest's `vmThreads` pool      | accepted |
