#!/usr/bin/env bash
# Checks whether each font in data/fonts/ has changed upstream, and for each
# one that has, opens an issue saying so, or updates the open one:
#
#   scripts/checkFonts.sh
#
# Needs the GitHub CLI, signed in. Run from the repo root.
set -euo pipefail

# Each font's path in data/fonts/, and the URL of its upstream copy.
fonts=(
  "noto/NotoSansCuneiform-Regular.ttf https://raw.githubusercontent.com/notofonts/notofonts.github.io/main/fonts/NotoSansCuneiform/unhinted/ttf/NotoSansCuneiform-Regular.ttf"
)

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# The font's version, such as 2.001, from the "Version 2.001" string that
# OpenType recommends for the name table's version record, or "unknown".
version() {
  strings --encoding=b "$1" | grep --only-matching --max-count=1 "Version [0-9]\+\.[0-9]\+" | head --lines=1 | cut --delimiter=" " --fields=2 || echo unknown
}

sha256() {
  sha256sum "$1" | cut --delimiter=" " --fields=1
}

# Opens or updates the issue for one font, which is found by its title's
# prefix.
check() {
  local path=$1 url=$2
  local ours=data/fonts/$path theirs=$work/upstream

  curl --fail --silent --show-error --location --output "$theirs" "$url"
  if cmp --silent "$theirs" "$ours"; then
    echo "$ours is up to date."
    return
  fi

  local prefix="Update $ours to "
  local title="$prefix$(version "$theirs")"
  local body
  body=$(cat <<END
[Upstream]($url) has a different copy of \`$ours\`.

| | Version | SHA-256 |
| --- | --- | --- |
| Ours | $(version "$ours") | \`$(sha256 "$ours")\` |
| Upstream | $(version "$theirs") | \`$(sha256 "$theirs")\` |
END
  )

  local open
  open=$(gh issue list --state open --limit 100 --json number,title,body \
    --jq "[.[] | select(.title | startswith(\"$prefix\"))][0] // empty")

  if [ -z "$open" ]; then
    gh issue create --title "$title" --body "$body" --assignee ianparkinson
  elif [ "$(jq -r .title <<<"$open")" != "$title" ] || [ "$(jq -r .body <<<"$open")" != "$body" ]; then
    gh issue edit "$(jq -r .number <<<"$open")" --title "$title" --body "$body"
  else
    echo "Issue #$(jq -r .number <<<"$open") is up to date."
  fi
}

for font in "${fonts[@]}"; do
  check $font
done
