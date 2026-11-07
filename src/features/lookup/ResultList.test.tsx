import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Tier, type LookupResult } from "@/core/lookup"

import { ResultList } from "./ResultList"

const ŠA: LookupResult = {
  entry: { kind: "sign", chars: "𒊭", names: ["ŠA"], values: ["ša"] },
  match: { text: "ša", kind: "value" },
  tier: Tier.Exact,
}
const AN: LookupResult = {
  entry: { kind: "sign", chars: "𒀭", names: ["AN"], values: ["an"] },
  match: { text: "AN", kind: "name" },
  tier: Tier.Exact,
}

describe("ResultList", () => {
  it("shows each result's name, and the value that matched", () => {
    render(<ResultList results={[ŠA]} onAppend={() => {}} onInfo={() => {}} />)
    expect(screen.getAllByRole("button")[0]).toHaveAccessibleName("ŠA ša")
  })

  it("doesn't repeat a name that matched", () => {
    render(<ResultList results={[AN]} onAppend={() => {}} onInfo={() => {}} />)
    expect(screen.getAllByRole("button")[0]).toHaveAccessibleName("AN")
  })

  it("appends the result tapped", async () => {
    const onAppend = vi.fn()
    const onInfo = vi.fn()
    render(
      <ResultList results={[ŠA, AN]} onAppend={onAppend} onInfo={onInfo} />,
    )
    await userEvent.click(screen.getByRole("button", { name: "AN" }))
    expect(onAppend).toHaveBeenCalledExactlyOnceWith(AN)
    expect(onInfo).not.toHaveBeenCalled()
  })

  it("opens a result's entry from its ⓘ", async () => {
    const onAppend = vi.fn()
    const onInfo = vi.fn()
    render(
      <ResultList results={[ŠA, AN]} onAppend={onAppend} onInfo={onInfo} />,
    )
    await userEvent.click(screen.getByRole("button", { name: "About ŠA" }))
    expect(onInfo).toHaveBeenCalledExactlyOnceWith(ŠA)
    expect(onAppend).not.toHaveBeenCalled()
  })
})
