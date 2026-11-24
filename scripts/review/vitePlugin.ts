/**
 * Serves data files from git history to the review page, in development
 * only: `<base>@review/show?ref=main&path=data/skeletons/noto.json`.
 */
import type { Plugin } from "vite"

import { gitShow, isAllowed } from "./gitShow.ts"

/** The path the review page fetches old files from, below the site's base. */
export const SHOW_PATH = "@review/show"

/** The Vite plugin that serves old data files to the review page. */
export function reviewPlugin(): Plugin {
  return {
    name: "wedges-review",
    // Only the development server uses the plugin: a build leaves it out.
    apply: "serve",
    configureServer(server) {
      const prefix = `${server.config.base}${SHOW_PATH}`
      server.middlewares.use(prefix, (request, response) => {
        const query = new URL(request.url ?? "", "http://localhost")
          .searchParams
        const ref = query.get("ref") ?? ""
        const path = query.get("path") ?? ""
        if (!isAllowed(ref, path)) {
          response.statusCode = 400
          response.end(`Can't read ${path} at ${ref}`)
          return
        }
        gitShow(ref, path).then(
          (bytes) => response.end(bytes),
          () => {
            response.statusCode = 404
            response.end(`No ${path} at ${ref}`)
          },
        )
      })
    },
  }
}
