# 0012: Render the home-screen icon at build time

- **Date:** 11 November 2026
- **Status:** accepted

## Context

Browsers take the favicon from `public/favicon.svg`, but iOS needs a PNG for the icon it shows when the app is added to the home screen. A PNG committed beside the SVG could drift from it when the favicon changes.

## Decision

A Vite plugin (`scripts/touchIcon/`) renders `apple-touch-icon.png` from the favicon with [`@resvg/resvg-js`](https://www.npmjs.com/package/@resvg/resvg-js), adds it to the build, serves it from the dev server and links it from `index.html`. Only the SVG is in the repo. resvg is a dev dependency with prebuilt native binaries, so the build needs no browser.

## Revisit when

resvg's binaries stop covering a platform the build runs on, or more icon sizes are needed (a web app manifest), when the same plugin could render those too.
