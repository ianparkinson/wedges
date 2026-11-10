# 0005: GitHub Pages hosting; accuracy benchmark in CI

- **Date:** 3 November 2026
- **Status:** accepted; benchmark moved into CI on 5 November 2026

## Context

Wedges is a static app. It needs HTTPS for the Clipboard API. GitHub Actions minutes are free for public repos, and limited to 2,000 a month for private ones.

## Decision

- Host on **GitHub Pages**, deployed from `main` by `.github/workflows/deploy.yml` once CI has passed on that commit. The site lives under `/wedges/`, which is Vite's `base`.
- Every pull request runs `.github/workflows/ci.yml`: `npm run check`, then Playwright e2e and accessibility tests on emulated Pixel 7 (Chromium) and iPhone 14 (WebKit).
- CI runs in Playwright's Docker image, `mcr.microsoft.com/playwright`, with the browsers and their system packages already installed. The workflow reads the image tag from the Playwright version in `package-lock.json`, so a Dependabot update moves both. Installing them on each run could take long enough to time the job out.
- The accuracy benchmark runs in `.github/workflows/accuracy-benchmark.yml`, on pull requests that touch `src/core`, `src/lib`, `data/` or the benchmark, and by hand from the Actions tab. It runs on the PR's base and on the PR, side by side, and comments on the PR with both results; a pull request from a fork, whose token can't comment, has them in the job summaries. It isn't a required check, so a pull request that doesn't touch those paths isn't held up. It uses standard runners, which cost nothing for public repos, and their minutes don't count against an account's private-repo allowance. Until 5 November 2026 it ran by hand.
- Performance timings **run by hand**, never in CI: shared runners are too noisy for the times to mean anything.
- Dependabot opens weekly update PRs, with CI as the gate.

## Revisit when

The repo becomes private (the benchmark would then use up its free minutes), or the phone-as-touchpad feature needs a signalling server (a Cloudflare Worker beside Pages, or moving to Cloudflare Pages).
