# AGENTS.md

Instructions for anyone, person or agent, changing this repo. Read this first. Keep it under about 150 lines, and update it in the same PR as any change it describes.

## What Wedges is

A mobile-first web app for entering cuneiform. You draw a sign one wedge at a time and pick it from the top three candidates, build up a sequence of signs and copy it, or look a sign up by name or value and see its entry in the [Oracc Sign List](https://oracc.museum.upenn.edu/osl/). It is hosted on GitHub Pages at https://ianparkinson.github.io/wedges/.

## Rules

1. **Never commit or push to `main`.** Work on a branch and open a pull request for Ian to review. Every change goes through a PR, however small.
2. **`npm run check` must pass before you push.** CI runs the same command plus the e2e tests.
3. **Respect the layers** (below). ESLint enforces them; do not disable the rule.
4. **No default exports.** Use named exports, except in tool config files that require a default.
5. **Tests sit beside the code:** `rank.ts` and `rank.test.ts`. A file with no test beside it should have a reason.
6. **Small, named pieces:** one component or concept per file, files under about 300 lines, named constants instead of magic numbers.
7. **Generated files say so in a header** and are rebuilt by a script, never edited by hand.
8. **Don't change recognition behaviour by accident.** If a PR touches `src/core/matcher` or `data/`, run the accuracy benchmark by hand and put the result in the PR description. If a behaviour change is intended, regenerate the fixtures in the same PR.
9. **Record decisions.** A choice that someone later might want to revisit gets a short file in `docs/decisions/`.

## Layers

```
src/
  core/      pure TypeScript: recognition, matching, lookup, sequence editing
  ui/        thin wrappers over React Aria Components, styled with CSS Modules
  features/  the app's panels: drawing, candidates, sequence, sign info, lookup
  app/       the app shell, layout, providers and tokens.css
```

Dependencies point one way only:

- `core` imports nothing outside `core`: no React, no DOM. Its own tsconfig (`tsconfig.core.json`) leaves the DOM out of `lib`, so `window` or `document` there is a type error.
- `ui` imports neither `core` nor `features`. It takes data as props.
- `features` use `ui` and `core`.
- `app` puts the features together.
- **Only `src/ui` imports `react-aria-components`.** Everything else imports our wrappers, such as `@/ui/Link/Link`, so the library can be swapped by changing one folder.

Import our own code through the `@/` alias (`@/core/geometry`), or relatively within a folder.

## Commands

| Command                           | What it does                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | dev server at http://localhost:5173/wedges/                                                          |
| `npm run check`                   | type checks, lint, format check, unit and component tests                                            |
| `npm run e2e`                     | Playwright tests on emulated Pixel 7 (Chromium) and iPhone 14 (WebKit), against the production build |
| `npm run format`                  | rewrite files with Prettier                                                                          |
| `npm run build`                   | production build into `dist/`                                                                        |
| `npm test` / `npm run test:watch` | Vitest only                                                                                          |

The first time you run e2e tests, install the browsers with `npx playwright install chromium webkit`.

## Style

- TypeScript strict, with `noUncheckedIndexedAccess`. Prefer narrowing over `!`; where `!` is genuinely safe, say why in a comment.
- Prettier with no semicolons, for code and Markdown alike. Imports are sorted by `@ianvs/prettier-plugin-sort-imports`: Node built-ins, packages, our own `@/` modules, relative imports, then CSS.
- Styles live in a CSS Module beside each component. Colours, spacing and type sizes come from the custom properties in `src/app/tokens.css`; don't hard-code them in components. Site-wide base styles are in `src/app/global.css`, on top of `modern-normalize`.
- Components are queried in tests by role and accessible name, as a user would find them.

## Comments

Write for an experienced software engineer who is new to this project and to cuneiform.

- Give exported functions, components and types a doc comment when their name and types don't say everything: units, coordinate frames, edge cases, or why they exist.
- Use implementation comments sparingly, for code that is surprising or genuinely complex. Don't restate what the code says.
- Link to the doc in `docs/` that explains an algorithm, rather than explaining it again in comments.

## Testing

| Level                           | Tool                                                    | Runs                         |
| ------------------------------- | ------------------------------------------------------- | ---------------------------- |
| Unit (`src/core`)               | Vitest                                                  | every PR, in `npm run check` |
| Component                       | Vitest and React Testing Library                        | every PR, in `npm run check` |
| E2E and accessibility           | Playwright, axe-core                                    | every PR, in CI              |
| Accuracy benchmark, performance | `npm run benchmark`, `npm run bench` (from milestone 2) | by hand, never in CI         |

## Where things are

- `docs/`: how the algorithms work, beside the code they describe (each `src/core` module's header comment links to its section), and [prior art](docs/prior-art.md): related projects, data sources and licences.
- `docs/decisions/`: decision records.
- `e2e/`: Playwright specs.
- `test/`: test setup, and tests that use seeded synthetic drawings from `synthetic/`.
- `.github/workflows/`: `ci.yml` (every PR and push to `main`) and `deploy.yml` (deploys `main` to GitHub Pages after CI passes).

## Data and licences

Code and templates are MIT. The Oracc Sign List data is CC0. Templates are traced over Noto Sans Cuneiform (SIL Open Font License). Check a font's licence before using it as a tracing reference; see [prior-art.md](docs/prior-art.md).
