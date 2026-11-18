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

it("puts the readings people expect first for the signs in discussion #78", async () => {
  const { usage } = await import("virtual:usage")
  const first = (chars: string) => [
    usage[chars]?.sux?.[0]?.value,
    usage[chars]?.akk?.[0]?.value,
  ]

  // KAK and KALAM@g: du₃ and un are the usual readings in both languages.
  expect(first("𒆕")).toEqual(["du₃", "du₃"])
  expect(first("𒌦")).toEqual(["un", "un"])
})
