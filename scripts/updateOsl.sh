#!/usr/bin/env bash
# Copies the latest osl.asl from github.com/oracc/osl over data/osl.asl and
# writes a pull request description for the change:
#
#   scripts/updateOsl.sh body.md
#
# The description names the upstream commit, lists the upstream commits since
# the commit the old copy came from, and gives npm run osl-summary's counts
# before and after. Prints a commit title and message, with the same list of
# upstream commits, as title=... and commit-message<<... lines, which the
# Update OSL workflow reads as step outputs. Run from the repo root, after
# npm ci.
set -euo pipefail

body=$1
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

npm run --silent osl-summary > "$work/before.txt"

# Blobless, so the clone holds every commit and tree but fetches only the
# file contents it reads.
git clone --quiet --filter=blob:none --no-checkout https://github.com/oracc/osl "$work/osl"
upstream() {
  git -C "$work/osl" "$@"
}

# Find the upstream commit our copy came from, by its contents.
ours=$(git hash-object data/osl.asl)
from=""
for commit in $(upstream log --format=%H -- 00lib/osl.asl); do
  if [ "$(upstream rev-parse "$commit:00lib/osl.asl")" = "$ours" ]; then
    from=$commit
    break
  fi
done

upstream show HEAD:00lib/osl.asl > data/osl.asl
sha=$(upstream rev-parse HEAD)
short=$(upstream rev-parse --short HEAD)
title="Update osl.asl to oracc/osl@$short"
unmatched="No upstream commit matches the old \`data/osl.asl\`, so it had been edited or came from elsewhere."

npm run --silent osl-summary > "$work/after.txt"

{
  echo "Copies \`00lib/osl.asl\` from [oracc/osl@$short](https://github.com/oracc/osl/blob/$sha/00lib/osl.asl) over \`data/osl.asl\`."
  echo
  if [ -n "$from" ]; then
    echo "Upstream commits since the last update:"
    echo
    upstream log --format="- [%h](https://github.com/oracc/osl/commit/%H) %ad %s" --date=short "$from..HEAD" -- 00lib/osl.asl
  else
    echo "$unmatched"
  fi
  echo
  echo "\`npm run osl-summary\`, before and after:"
  echo '```'
  cat "$work/before.txt" "$work/after.txt"
  echo '```'
} > "$body"

echo "title=$title"
echo "commit-message<<END_OF_COMMIT_MESSAGE"
echo "$title"
echo
echo "From https://github.com/oracc/osl/commit/$sha"
echo
if [ -n "$from" ]; then
  echo "Upstream commits since the last update:"
  echo
  upstream log --format="%h %ad %s" --date=short "$from..HEAD" -- 00lib/osl.asl
else
  echo "$unmatched"
fi
echo "END_OF_COMMIT_MESSAGE"
