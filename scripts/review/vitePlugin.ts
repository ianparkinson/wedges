/**
 * Serves the review page's requests to the development server, which only
 * it can answer: data files from git history, read with
 * `<base>@review/show?ref=main&path=data/skeletons/noto.json`, and edited
 * shapes, saved by posting a `ShapesEdit` (see saveShapes.ts) to
 * `<base>@review/save`.
 */
import type { IncomingMessage } from "node:http"

import type { Plugin } from "vite"

import { gitShow, isAllowed } from "./gitShow.ts"
import { readEdit, saveShapes } from "./saveShapes.ts"

/** The path the review page fetches old files from, below the site's base. */
export const SHOW_PATH = "@review/show"

/** The path the review page posts edited shapes to, below the site's base. */
export const SAVE_PATH = "@review/save"

/** The Vite plugin that answers the review page's requests. */
export function reviewPlugin(): Plugin {
  return {
    name: "wedges-review",
    // Only the development server uses the plugin: a build leaves it out.
    apply: "serve",
    configureServer(server) {
      const { base, root } = server.config

      server.middlewares.use(`${base}${SHOW_PATH}`, (request, response) => {
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

      server.middlewares.use(`${base}${SAVE_PATH}`, (request, response) => {
        if (request.method !== "POST") {
          response.statusCode = 405
          response.end()
          return
        }
        readJson(request)
          .then((body) => saveShapes(root, readEdit(body)))
          .then(
            () => {
              response.statusCode = 204
              response.end()
            },
            (error: unknown) => {
              response.statusCode = 400
              response.end(error instanceof Error ? error.message : "")
            },
          )
      })
    },
  }
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(chunk as Buffer)
  return JSON.parse(Buffer.concat(chunks).toString("utf8"))
}
