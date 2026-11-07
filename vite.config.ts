import { fileURLToPath } from "node:url"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

import { oslPlugin } from "./scripts/osl/vitePlugin.ts"

// GitHub Pages serves the site from https://ianparkinson.github.io/wedges/.
const base = "/wedges/"

export default defineConfig({
  base,
  plugins: [react(), oslPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    // See docs/decisions/0009-vm-threads-pool.md.
    pool: "vmThreads",
    setupFiles: ["./test/setup.ts"],
    include: [
      "src/**/*.test.{ts,tsx}",
      "test/**/*.test.{ts,tsx}",
      "scripts/**/*.test.ts",
    ],
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
})
