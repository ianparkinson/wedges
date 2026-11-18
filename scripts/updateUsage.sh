#!/usr/bin/env bash
# Downloads every public Oracc project's JSON, rebuilds data/usage/ from the
# glossaries in it, and writes a pull request description for the change:
#
#   scripts/updateUsage.sh body.md
#
# Prints a commit title and message as title=... and commit-message<<...
# lines, which the Update usage workflow reads as step outputs. Run from the
# repo root, after npm ci. Needs curl, jq, openssl and unzip, and about 2 GB
# of disk.
set -euo pipefail

body=$1
host=oracc.museum.upenn.edu
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# Oracc's server sends its certificate without the intermediate certificate
# that signed it, so curl can't build a chain to a trusted root. Browsers fill
# the gap by downloading the intermediate from the address in the server's
# certificate (its Authority Information Access), and so does this. The
# intermediate is checked against the system's roots before it's trusted.
openssl s_client -connect "$host:443" -servername "$host" < /dev/null 2> /dev/null |
  openssl x509 > "$work/server.pem"
issuer=$(openssl x509 -in "$work/server.pem" -noout -ext authorityInfoAccess |
  sed -n 's/^ *CA Issuers - URI://p')
curl -sSf "$issuer" | openssl x509 -inform DER > "$work/intermediate.pem"
roots="$(openssl version -d | cut -d '"' -f 2)/cert.pem"
openssl verify -CAfile "$roots" "$work/intermediate.pem" > /dev/null
cat "$roots" "$work/intermediate.pem" > "$work/ca.pem"

oracc() {
  curl -sSf --retry 3 --cacert "$work/ca.pem" "$@"
}

# A project's zip is named after it, with slashes as hyphens. Not every public
# project has one.
mkdir "$work/zips"
missing=()
for project in $(oracc "https://$host/projects.json" | jq -r '.public[]'); do
  zip="$work/zips/${project//\//-}.zip"
  if ! oracc -o "$zip" "https://$host/json/${project//\//-}.zip" 2> /dev/null; then
    rm -f "$zip"
    missing+=("$project")
  fi
done

npm run --silent build-usage -- "$work"/zips/*.zip > "$work/summary.md"
npx prettier --log-level warn --write data/usage

title="Update sign usage from Oracc's glossaries"
{
  echo "Rebuilds \`data/usage/\` from the glossaries of every public Oracc project, downloaded from https://$host/json/."
  echo
  cat "$work/summary.md"
  echo
  echo "Public projects with no JSON to download: ${missing[*]:-none}."
  echo
  echo "Check CI before merging."
} > "$body"

echo "title=$title"
echo "commit-message<<END_OF_COMMIT_MESSAGE"
echo "$title"
echo
cat "$work/summary.md"
echo "END_OF_COMMIT_MESSAGE"
