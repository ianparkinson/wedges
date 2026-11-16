# 0014: A pull request with each new `osl.asl`

- **Date:** 16 November 2026
- **Status:** accepted

## Context

`data/osl.asl` is a copy of the Oracc Sign List's source file ([0003](0003-json-data.md)), which changes upstream about once a week. Copying it in by hand was easy to forget, and every update needs the same review: what changed upstream, whether the counts moved, and whether CI and the accuracy benchmark still pass.

## Decision

`.github/workflows/update-osl.yml` runs every day, and by hand from the Actions tab. Through `scripts/updateOsl.sh`, which can also be run by hand, it copies `00lib/osl.asl` from github.com/oracc/osl and, when it differs from ours, uses [`peter-evans/create-pull-request`](https://github.com/peter-evans/create-pull-request) to open a pull request from the `update-osl` branch, or update the open one, assigned to Ian. Nothing is merged without review.

- **The pull request is opened by a GitHub App, Wedges updates**, whose token comes from `actions/create-github-app-token`. Pull requests opened with the workflow's own `GITHUB_TOKEN` don't start other workflows, so CI and the accuracy benchmark wouldn't run. An app's tokens last an hour and need no renewing, unlike a personal access token. The app can write contents and pull requests in this repo only. Its client id is the repository variable `UPDATES_APP_CLIENT_ID`, and its private key the secret `UPDATES_APP_PRIVATE_KEY`.
- **Commits are signed by the app** (`sign-commits`), so they show as its own and need no author email.
- **No file records the upstream version.** The commit message and pull request name the upstream commit, and the workflow finds the commit our copy came from by matching the file's contents, to list what changed since.
- It runs daily so an update arrives soon after it's made upstream. Most days nothing has changed and no pull request is opened. When a pull request is already open, a newer upstream change updates it, and CI and the benchmark run again.
- It runs on standard `ubuntu-latest` runners, which cost nothing for public repos.

## Revisit when

The repo becomes private (each run, and the CI it starts, would use up free minutes); the repo goes 60 days without activity, when GitHub turns scheduled workflows off; or we vendor another Oracc file, such as `epsd27.tok` (issue #79), which the same workflow could copy.
