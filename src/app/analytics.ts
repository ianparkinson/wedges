/**
 * Counts visits to the deployed site with GoatCounter, which sets no cookies
 * and keeps no personal data. See docs/decisions/0013-goatcounter-analytics.md.
 */

/** The GoatCounter site that receives the counts, and shows them. */
const GOATCOUNTER_URL = "https://wedges.goatcounter.com/count"

/** GoatCounter's script, which counts the page view once it loads. */
const SCRIPT_URL = "https://gc.zgo.at/count.js"

/**
 * The only host whose visits count. Dev servers, previews, e2e tests and
 * forks deployed to their own GitHub Pages are served from other hosts.
 */
const COUNTED_HOST = "ianparkinson.github.io"

/**
 * Counts this visit by loading GoatCounter's script, unless the page is
 * served from a host other than the deployed site's.
 */
export function countVisit(hostname: string) {
  if (hostname !== COUNTED_HOST) return

  const script = document.createElement("script")
  script.async = true
  script.src = SCRIPT_URL
  script.dataset["goatcounter"] = GOATCOUNTER_URL
  document.head.append(script)
}
