# 0013: Count visits with GoatCounter

- **Date:** 14 November 2026
- **Status:** accepted

## Context

We want to know roughly how many people use Wedges, and where they come from, without tracking anyone. GitHub Pages gives no visitor statistics of its own.

## Decision

The deployed site counts page views with [GoatCounter](https://www.goatcounter.com/), which sets no cookies, stores no IP addresses or other personal data, and needs no consent banner. `src/app/analytics.ts` loads GoatCounter's script at start-up, but only when the page is served from `ianparkinson.github.io`, so dev servers, `vite preview`, e2e tests and forks deployed to their own GitHub Pages count nothing, and send no requests to GoatCounter. The counts go to the `wedges` site on goatcounter.com, and the About sheet says that visits are counted.

## Revisit when

The app gets a Content Security Policy, which would need to allow `gc.zgo.at` and `wedges.goatcounter.com`; the app starts changing its URL as it moves between views, which `count.js` would not count without help; or we want to stop loading a script from a third party, when `count.js` could be served from `public/` instead.
