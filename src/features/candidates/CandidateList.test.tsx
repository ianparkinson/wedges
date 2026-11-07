import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { Sign } from "@/core/signs"

import { CandidateList } from "./CandidateList"

function sign(char: string, name: string): Sign {
  return { char, name, oslId: name, values: [], samples: [] }
}

const AN = sign("𒀭", "AN")
const MAŠ = sign("𒈦", "MAŠ")
const BAD = sign("𒁁", "BAD")

describe("CandidateList", () => {
  it("lists the candidates by name, best first", () => {
    render(
      <CandidateList
        candidates={[AN, MAŠ, BAD]}
        isLoading={false}
        onPick={() => {}}
        onInfo={() => {}}
      />,
    )
    const items = within(screen.getByRole("list"))
      .getAllByRole("button")
      .filter((button) => !button.getAttribute("aria-label"))
    expect(items.map((item) => item.textContent)).toEqual([
      "𒀭AN",
      "𒈦MAŠ",
      "𒁁BAD",
    ])
  })

  it("picks the candidate tapped", async () => {
    const onPick = vi.fn()
    render(
      <CandidateList
        candidates={[AN, MAŠ, BAD]}
        isLoading={false}
        onPick={onPick}
        onInfo={() => {}}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "MAŠ" }))
    expect(onPick).toHaveBeenCalledExactlyOnceWith(MAŠ)
  })

  it("picks the best candidate with Accept best", async () => {
    const onPick = vi.fn()
    render(
      <CandidateList
        candidates={[AN, MAŠ, BAD]}
        isLoading={false}
        onPick={onPick}
        onInfo={() => {}}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Accept best" }))
    expect(onPick).toHaveBeenCalledExactlyOnceWith(AN)
  })

  it("opens a candidate's entry with its ⓘ, without picking it", async () => {
    const onPick = vi.fn()
    const onInfo = vi.fn()
    render(
      <CandidateList
        candidates={[AN, MAŠ, BAD]}
        isLoading={false}
        onPick={onPick}
        onInfo={onInfo}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "About MAŠ" }))
    expect(onInfo).toHaveBeenCalledExactlyOnceWith(MAŠ)
    expect(onPick).not.toHaveBeenCalled()
  })

  it("asks for a drawing when there are no candidates", () => {
    render(
      <CandidateList
        candidates={[]}
        isLoading={false}
        onPick={() => {}}
        onInfo={() => {}}
      />,
    )
    expect(screen.getByText(/Draw a sign/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Accept best" })).toBeDisabled()
  })

  it("says so while the signs are loading", () => {
    render(
      <CandidateList
        candidates={[]}
        isLoading
        onPick={() => {}}
        onInfo={() => {}}
      />,
    )
    expect(screen.getByText("Loading signs…")).toBeInTheDocument()
  })
})
