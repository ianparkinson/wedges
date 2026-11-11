# AGENTS.md

Instructions for anyone, person or agent, changing this repo. Read this first. Keep it under about 150 lines, and update it in the same PR as any change it describes.

## What Wedges is

A mobile-first web app for entering cuneiform. You draw a sign one wedge at a time and pick it from the top three candidates, build up a sequence of signs and copy it, or look a sign up by name or value and see its entry in the [Oracc Sign List](https://oracc.museum.upenn.edu/osl/). It is hosted on GitHub Pages at https://ianparkinson.github.io/wedges/.

## Rules

1. **Never commit or push to `main`.** Work on a branch and open a pull request for Ian to review. Every change goes through a PR, however small.
2. **`npm run check` must pass before you push.** CI runs the same command plus the e2e tests.
3. **Respect the layers** (below). ESLint enforces them; do not disable the rule.
4. **Tests sit beside the code:** `rank.ts` and `rank.test.ts`. A file with no test beside it should have a reason.
5. **Small, named pieces:** one component or concept per file, files under about 300 lines, named constants instead of magic numbers.
6. **Generated files say so in a header** and are rebuilt by a script, never edited by hand.
7. **Don't change recognition behaviour by accident.** When a PR touches `src/core`, `src/lib` or `data/`, the Accuracy Benchmark workflow runs the accuracy benchmark on the PR's base and on the PR, and comments with both results; check them before merging. If a behaviour change is intended, say what changed and why in the PR description.
8. **Record decisions.** A choice that someone later might want to revisit gets a short file in `docs/decisions/`.

## Layers

```
src/
  lib/       pure TypeScript helpers that know nothing of the app: geometry, collections, numbers
  core/      pure TypeScript: recognition, matching, lookup, sequence editing
  ui/        thin wrappers over React Aria Components, styled with CSS Modules
  features/  the app's panels: drawing, candidates, sequence, sign info, lookup, about
  app/       the app shell, layout, providers and tokens.css
```

Dependencies point one way only:

- `lib` imports nothing of ours: no React, no DOM, and nothing about cuneiform or the app. Anything may import it.
- `core` imports nothing outside `core` and `lib`: no React, no DOM. Their tsconfig (`tsconfig.core.json`) leaves the DOM out of its `lib` setting, so `window` or `document` there is a type error.
- `ui` imports neither `core` nor `features`. It takes data as props.
- `features` use `ui` and `core`.
- `app` puts the features together.
- **Only `src/ui` imports `react-aria-components`.** Everything else imports our wrappers, such as `@/ui/Link/Link`, so the library can be swapped by changing one folder.

## Commands

| Command                           | What it does                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | dev server at http://localhost:5173/wedges/, also on the local network for testing on a phone        |
| `npm run check`                   | type checks, lint, format check, unit and component tests                                            |
| `npm run e2e`                     | Playwright tests on emulated Pixel 7 (Chromium) and iPhone 14 (WebKit), against the production build |
| `npm run format`                  | rewrite files with Prettier                                                                          |
| `npm run build`                   | production build into `dist/`                                                                        |
| `npm run bench:accuracy`          | accuracy benchmark: every skeleton drawn 40 times with noise (a few minutes)                         |
| `npm run bench:performance`       | ranking time in headless Chromium with the CPU throttled 4×                                          |
| `npm run osl-summary`             | count what the sign data built from `data/osl.asl` holds                                             |
| `npm test` / `npm run test:watch` | Vitest only                                                                                          |

The first time you run e2e tests, install the browsers with `npx playwright install chromium webkit`.

## Style

Follow the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html). Prettier decides formatting, so its config wins over the guide on layout and quotes. The rest of this file wins where it differs from the guide, and adds rules the guide doesn't have.

Where we differ from the guide:

- **File names** are camelCase (`pairCost.ts`), not snake_case. Component files are PascalCase, named after the component they export (`Link/Link.tsx`), as is usual in React projects.
- **Imports** in `src` use `./` only for a file in the same folder (`./Button.module.css`). Anything in another folder goes through an alias: `@/` for `src` (`@/lib/geometry`), `@test/` for `test` (`@test/smallDatabase`). ESLint rejects `../`, so the layer rules see every import between folders.
- **A `switch` over every member of a union needs no `default`**, so the compiler reports a case that a new member leaves unhandled.

Beyond the guide:

- TypeScript strict, with `noUncheckedIndexedAccess`.
- Prettier with no semicolons, for code and Markdown alike. Imports are sorted by `@ianvs/prettier-plugin-sort-imports`: Node built-ins, packages, our own `@/` and `@test/` modules, `./` imports, then CSS.
- Styles live in a CSS Module beside each component. Colours, spacing and type sizes come from the custom properties in `src/app/tokens.css`; don't hard-code them in components. Site-wide base styles are in `src/app/global.css`, on top of `modern-normalize`.
- Components are queried in tests by role and accessible name, as a user would find them.
- Keep a diff to its change: no stray whitespace or newline edits in other files.

## Code shape

- **Branch on a kind with `switch`**, or `if`/`else`, so each case reads as an alternative, not a fallback after an early return.
  - Genuine early returns, such as precondition validation, can of course precede the main flow without nesting the bulk of code in an `else`.
- **Write code in paragraphs.** Separate the steps of a function with a blank line, the way paragraphs separate the ideas in prose. An implementation comment introduces the paragraph below it, so give it a blank line above, unless it opens a block.
- **Break a function up** instead of nesting loops with `break` and `continue`, or when it runs through several stages: named helpers make the flow readable.
- **Only what's needed now.** No functions the current work doesn't use, no defensive errors a user can't act on, no copies of `readonly` data.
- **Prefer to avoid parameters passed just to build an error message**. Throw, and let the caller add context.
- **Reuse before writing.** Prefer a standard tool or package to bespoke code outside the problem domain, and look for an existing helper first: generic helpers (points and angles, collections, numbers) are in `src/lib`. A new helper that knows nothing of cuneiform or the app goes there too, with its tests.

## Comments

Write for an experienced software engineer who is new to this project and to cuneiform.

- A doc comment says what the name and types don't: units, coordinate frames, edge cases, or why it exists.
- Open a doc comment with what the function does, in plain words, even when the file's header says it too.
- Use implementation comments sparingly, for code that is surprising or genuinely complex. Don't restate what the code says, or explain a standard idiom.
- Describe the code as it is, not where it came from or how it changed: git keeps history.
- Docs arrive with the code they describe, and leave out counts or details that would go stale with each data update.
- Link to the doc in `docs/` that explains an algorithm, rather than explaining it again in comments.

## Testing

| Level                 | Tool                             | Runs                                        |
| --------------------- | -------------------------------- | ------------------------------------------- |
| Unit (`core`, `lib`)  | Vitest                           | every PR, in `npm run check`                |
| Component             | Vitest and React Testing Library | every PR, in `npm run check`                |
| E2E and accessibility | Playwright, axe-core             | every PR, in CI                             |
| Accuracy benchmark    | `npm run bench:accuracy`         | in CI, on PRs that could change recognition |
| Performance           | `npm run bench:performance`      | by hand, never in CI                        |

- **Tests state what they expect and why.** Hand-written cases with descriptive names, so a failure says what broke. No golden or snapshot files of generated output, whose diffs can't be reviewed, and no randomised brute-force tests, whose failures can't be acted on.

## Where things are

- `docs/`: how the algorithms work, beside the code they describe (each `src/core` module's header comment links to its section), and [prior art](docs/prior-art.md): related projects, data sources and licences.
- `docs/decisions/`: decision records.
- `data/`: sign skeletons and their JSON Schema, and a copy of the Oracc Sign List's `osl.asl` ([skeleton-format.md](docs/skeleton-format.md), [sign-data.md](docs/sign-data.md)).
- `e2e/`: Playwright specs.
- `test/`: test setup, and tests that use seeded synthetic drawings from `synthetic/`.
- `scripts/`: Node scripts, run with `tsx`.
- `public/`: files served as they are, such as the favicon. The build renders the home-screen icon from the favicon (`scripts/touchIcon/`).
- `.github/workflows/`: `ci.yml` (every PR and push to `main`) and `deploy.yml` (deploys `main` to GitHub Pages after CI passes).

## Data and licences

Code and skeletons are MIT. The Oracc Sign List data is CC0. Skeletons are traced over Noto Sans Cuneiform (SIL Open Font License), which the app also bundles to show signs. Check a font's licence before using it as a tracing reference; see [prior-art.md](docs/prior-art.md).
