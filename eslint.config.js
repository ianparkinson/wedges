// @ts-check
import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

/**
 * Layer rule (see docs/decisions/0004-layers.md):
 *   features -> ui, core;  ui -> nothing of ours;  core -> nothing but core.
 * Only src/ui may import react-aria-components, so swapping the primitive
 * library touches one folder.
 */
const reactAria = {
  name: "react-aria-components",
  message: "Import our wrappers from @/ui instead.",
}
const layer = (/** @type {string} */ name, /** @type {string} */ why) => ({
  group: [`@/${name}`, `@/${name}/**`],
  message: why,
})

export default defineConfig([
  globalIgnores(["dist", "coverage", "playwright-report", "test-results"]),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Named exports only: they keep names consistent across imports.
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message: "Use a named export.",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: { globals: globals.browser },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": ["error", { paths: [reactAria] }],
    },
  },
  {
    files: ["src/core/**/*.ts"],
    languageOptions: { globals: {} },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            reactAria,
            { name: "react", message: "src/core must not use React." },
            { name: "react-dom", message: "src/core must not use React." },
          ],
          patterns: [
            layer("ui", "src/core must not depend on src/ui."),
            layer("features", "src/core must not depend on src/features."),
            layer("app", "src/core must not depend on src/app."),
          ],
        },
      ],
    },
  },
  {
    files: ["src/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            layer(
              "core",
              "src/ui is presentation only; pass data in as props.",
            ),
            layer("features", "src/ui must not depend on src/features."),
            layer("app", "src/ui must not depend on src/app."),
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [reactAria],
          patterns: [layer("app", "src/features must not depend on src/app.")],
        },
      ],
    },
  },
  {
    // Tool config files must default-export their configuration.
    files: ["*.config.{js,ts}"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["*.config.js"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
])
