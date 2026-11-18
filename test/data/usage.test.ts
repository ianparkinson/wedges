import { Ajv2020 } from "ajv/dist/2020"
import { expect, it } from "vitest"

import schema from "../../data/schemas/usage.schema.json"

const files = import.meta.glob<unknown>("../../data/usage/*.json", {
  eager: true,
  import: "default",
})

it("has usage files that match their schema", () => {
  const validate = new Ajv2020({ allErrors: true }).compile(schema)
  for (const [path, file] of Object.entries(files)) {
    expect(validate(file), `${path}: ${JSON.stringify(validate.errors)}`).toBe(
      true,
    )
  }
})
