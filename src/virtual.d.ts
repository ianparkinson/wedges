/** The sign data, built from data/osl.asl at build time by scripts/osl/vitePlugin.ts. */
declare module "virtual:osl" {
  import type { OslData } from "@/core/types"

  export const osl: OslData
}

/**
 * What the sign info panel shows about each sign's usage, by its characters,
 * built at build time by scripts/usage/vitePlugin.ts.
 */
declare module "virtual:usage" {
  import type { SignUsage } from "@/core/types"

  export const usage: Readonly<Record<string, SignUsage>>
}
