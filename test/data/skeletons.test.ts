import { Ajv2020 } from "ajv/dist/2020"
import { describe, expect, it } from "vitest"

import { parseSpec } from "@/core/spec"

import schema from "../../data/schemas/skeletons.schema.json"

const files = import.meta.glob<{ skeletons: { char: string; spec: string }[] }>(
  "../../data/skeletons/*.json",
  { eager: true, import: "default" },
)

const entries = Object.entries(files).map(
  ([path, file]) => [path.replace("../../", ""), file] as const,
)

describe.each(entries)("%s", (_, file) => {
  it("matches its schema", () => {
    const validate = new Ajv2020({ allErrors: true }).compile(schema)
    expect(validate(file), JSON.stringify(validate.errors)).toBe(true)
  })

  it("has a spec that parses for every entry", () => {
    for (const { char, spec } of file.skeletons) {
      expect(parseSpec(spec).length, char).toBeGreaterThan(0)
    }
  })
})
