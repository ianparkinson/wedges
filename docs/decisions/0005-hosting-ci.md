# 0005: GitHub Pages hosting; benchmarks by hand, not in CI

- **Date:** 3 November 2026
- **Status:** accepted

## Context

Wedges is a static app. It needs HTTPS for the Clipboard API. GitHub Actions minutes are free for public repos, and limited to 2,000 a month for private ones.

## Decision

- Host on **GitHub Pages**, deployed from `main` by `.github/workflows/deploy.yml` once CI has passed on that commit. The site lives under `/wedges/`, which is Vite's `base`.
- Every pull request runs `.github/workflows/ci.yml`: `npm run check`, then Playwright e2e and accessibility tests on emulated Pixel 7 (Chromium) and iPhone 14 (WebKit).
- CI runs in Playwright's Docker image, `mcr.microsoft.com/playwright`, with the browsers and their system packages already installed. The workflow reads the image tag from the Playwright version in `package-lock.json`, so a Dependabot update moves both. Installing them on each run could take long enough to time the job out.
- The accuracy benchmark and performance timings take minutes, so they **run by hand**, never in CI or on a schedule. The PR template asks for the result when a PR touches matching or data.
- Dependabot opens weekly update PRs, with CI as the gate.

## Revisit when

Running the benchmark locally becomes a chore (add a manually triggered workflow), or the phone-as-touchpad feature needs a signalling server (a Cloudflare Worker beside Pages, or moving to Cloudflare Pages).
