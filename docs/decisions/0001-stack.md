# 0001: TypeScript, Vite, React and CSS Modules

- **Date:** 3 November 2026
- **Status:** accepted

## Context

The hard part of Wedges, recognising strokes and matching them against signs, is plain TypeScript with no framework in it. The framework only carries a small UI: a drawing pad, a candidate list, an output line and a lookup panel. The project is meant to be maintained for a long time by people and agents, so familiarity, tooling and long-term support matter more than raw size or speed.

## Decision

- **TypeScript**, strict, with `noUncheckedIndexedAccess`. Types are the cheapest documentation, and index checks matter in matrix-heavy matching code.
- **Vite** to build. A static single-page app needs no server rendering, and Vitest shares Vite's config.
- **React 19.** The most widely known UI library, so the most readable for people and agents, with the best testing support. Preact is a drop-in fallback if size ever matters.
- **CSS Modules** beside each component, plus one `tokens.css` of custom properties. Plain CSS, no runtime cost; Tailwind was rejected because long class strings bury intent.
- **State** in React state, `useReducer` and context. The state is small, so no Redux or Zustand.
- **ESLint** with typescript-eslint, and **Prettier** without semicolons, with `@ianvs/prettier-plugin-sort-imports` for import order. That plugin never reorders imports across a side-effect import such as `import './tokens.css'`, where order matters.
- **Vitest** and React Testing Library for unit and component tests; **Playwright** for e2e tests on emulated phones.

## Consequences

React adds about 45 KB gzipped, small next to roughly 340 KB of sign data.

## Revisit when

Bundle size becomes a real problem on phones (try Preact first), or the ranking work needs a Web Worker (decided in milestone 2).
