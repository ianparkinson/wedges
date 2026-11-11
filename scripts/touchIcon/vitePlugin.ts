/**
 * Serves apple-touch-icon.png, rendered from public/favicon.svg, so the
 * home-screen icon always matches the favicon without a second image in the
 * repo.
 */
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

import type { Plugin } from "vite"

import { renderTouchIcon } from "./renderTouchIcon.ts"

const FAVICON = new URL("../../public/favicon.svg", import.meta.url)
const FILE_NAME = "apple-touch-icon.png"

async function touchIconPng(): Promise<Buffer> {
  return renderTouchIcon(await readFile(FAVICON, "utf8")).asPng()
}

/**
 * The Vite plugin that adds apple-touch-icon.png to the build, serves it from
 * the dev server, and links it from index.html.
 */
export function touchIconPlugin(): Plugin {
  let base = "/"
  return {
    name: "wedges-touch-icon",
    configResolved(config) {
      base = config.base
    },
    async generateBundle() {
      this.addWatchFile(fileURLToPath(FAVICON))
      this.emitFile({
        type: "asset",
        fileName: FILE_NAME,
        source: await touchIconPng(),
      })
    },
    transformIndexHtml() {
      return [
        {
          tag: "link",
          attrs: { rel: "apple-touch-icon", href: base + FILE_NAME },
          injectTo: "head",
        },
      ]
    },
    configureServer(server) {
      server.middlewares.use(base + FILE_NAME, (_request, response) => {
        void touchIconPng().then((png) => {
          response.setHeader("Content-Type", "image/png")
          response.end(png)
        })
      })
    },
  }
}
