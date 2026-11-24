import type { Font } from "opentype.js"
import { useEffect, useMemo, useState } from "react"

import type { CuneiformBlock } from "@/core/cuneiform"
import type { OslData, SkeletonFile } from "@/core/types"
import { useUrlState } from "@/ui/hooks/useUrlState"

import { skeletonFonts } from "./redraw/fonts"
import { redrawLimits } from "./redraw/limits"
import { skeletonFiles, useFont, useOsl } from "./reviewData"
import styles from "./ReviewPage.module.css"
import { reviewSigns, type ReviewSign, type SignGroup } from "./reviewSigns"
import { SignDetail } from "./SignDetail"
import { hasStatus, isFailing, SORTS, sortSigns, STATUSES } from "./signFilters"
import { SignTile } from "./SignTile"
import { Choice } from "./ui/Choice"
import { useReviewed } from "./useReviewed"
import { useScores } from "./useScores"

const DEFAULT_FILE = "noto-next"

/**
 * The review page: every glyph in a skeleton file's font with its skeleton
 * drawn over it, to sort, filter, and mark as reviewed. See
 * docs/review-tooling.md.
 */
export function ReviewPage() {
  const [fileId, setFileId] = useUrlState("file", DEFAULT_FILE)
  const file = skeletonFiles[fileId]
  const font = skeletonFonts[fileId]

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Skeleton review</h1>
        <label>
          File{" "}
          <select value={fileId} onChange={(e) => setFileId(e.target.value)}>
            {Object.keys(skeletonFiles).map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
      </header>
      {file && font ? (
        <FileReview
          key={fileId}
          fileId={fileId}
          file={file}
          fontPath={font.path}
        />
      ) : (
        <p>No skeleton file or font called {fileId}.</p>
      )}
    </main>
  )
}

interface FileReviewProps {
  fileId: string
  file: SkeletonFile
  fontPath: string
}

function FileReview({ fileId, file, fontPath }: FileReviewProps) {
  const font = useFont(fontPath)
  const osl = useOsl()
  return font && osl ? (
    <LoadedReview fileId={fileId} file={file} font={font} osl={osl} />
  ) : (
    <p>Loading the font and sign list…</p>
  )
}

const GROUPS = [
  "all",
  "simple",
  "modified",
  "compound",
  "unlisted",
] as const satisfies readonly ("all" | SignGroup)[]
const BLOCKS = [
  "all",
  "main",
  "numbers",
  "earlyDynastic",
] as const satisfies readonly ("all" | CuneiformBlock)[]

interface LoadedReviewProps {
  fileId: string
  file: SkeletonFile
  font: Font
  osl: OslData
}

function LoadedReview({ fileId, file, font, osl }: LoadedReviewProps) {
  const { style } = skeletonFonts[fileId]!
  const limits = redrawLimits[fileId]
  const reviewed = useReviewed(fileId)
  const [group, setGroup] = useUrlState("group", "all", GROUPS)
  const [block, setBlock] = useUrlState("block", "all", BLOCKS)
  const [status, setStatus] = useUrlState("status", "all", STATUSES)
  const [sort, setSort] = useUrlState("sort", "file", SORTS)
  const [selectedKey, setSelectedKey] = useUrlState("sign", "")

  const current = useMemo(() => reviewSigns(file, font, osl), [file, font, osl])
  const { signs, pending } = useScores(
    current,
    font,
    file.winkelhakenAngle,
    style,
  )
  const shown = useMemo(
    () =>
      sortSigns(
        signs.filter(
          (sign) =>
            (group === "all" || sign.group === group) &&
            (block === "all" || sign.block === block) &&
            hasStatus(sign, status, reviewed, limits),
        ),
        sort,
      ),
    [signs, group, block, status, sort, reviewed, limits],
  )
  const revealed = useRevealed(
    shown.length,
    [group, block, status, sort].join("|"),
  )
  const grid = shown.slice(0, revealed)

  const selectedIndex = shown.findIndex((sign) => sign.key === selectedKey)
  const selected = shown[selectedIndex]
  const step = (by: number) => {
    const next = shown[selectedIndex + by]
    if (next) setSelectedKey(next.key)
  }
  /** Marks a sign reviewed and moves on to the next, or unmarks it. */
  const markReviewed = (sign: ReviewSign, value: boolean) => {
    if (!sign.shapes) return
    // Found before marking, since marking can filter the sign out.
    const next = shown[selectedIndex + 1]
    reviewed.setReviewed(sign.text, sign.shapes, value)
    if (value && next) setSelectedKey(next.key)
  }

  useEffect(() => {
    if (!selected) return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLSelectElement ||
        target instanceof HTMLInputElement
      ) {
        return
      }
      switch (event.key) {
        case "ArrowLeft":
          step(-1)
          break
        case "ArrowRight":
          step(1)
          break
        case "r":
          markReviewed(
            selected,
            !reviewed.isReviewed(selected.text, selected.shapes ?? []),
          )
          break
        case "Escape":
          setSelectedKey("")
          break
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const traced = current.filter((sign) => sign.shapes)
  const counts = {
    glyphs: current.length,
    traced: traced.length,
    reviewed: traced.filter((r) => reviewed.isReviewed(r.text, r.shapes!))
      .length,
    failing: signs.filter((r) => isFailing(r, limits)).length,
  }

  return (
    <>
      <div className={styles.toolbar}>
        <Choice
          label="Group"
          value={group}
          options={GROUPS}
          onChange={setGroup}
        />
        <Choice
          label="Block"
          value={block}
          options={BLOCKS}
          onChange={setBlock}
        />
        <Choice
          label="Status"
          value={status}
          options={STATUSES}
          onChange={setStatus}
        />
        <Choice label="Sort" value={sort} options={SORTS} onChange={setSort} />
        <p className={styles.counts}>
          {counts.glyphs} glyphs, {counts.traced} traced, {counts.reviewed}{" "}
          reviewed, {counts.failing} failing the data test. Showing{" "}
          {shown.length}.{pending > 0 && ` Scoring ${pending} more…`}
        </p>
      </div>
      <div className={selected ? styles.split : undefined}>
        <ul className={styles.grid}>
          {grid.map((sign) => (
            <li key={sign.key}>
              <SignTile
                sign={sign}
                font={font}
                winkelhakenAngle={file.winkelhakenAngle}
                style={style}
                limits={limits}
                isReviewed={
                  sign.shapes !== undefined &&
                  reviewed.isReviewed(sign.text, sign.shapes)
                }
                isSelected={sign.key === selectedKey}
                onSelect={setSelectedKey}
              />
            </li>
          ))}
        </ul>
        {selected && (
          <div className={styles.side}>
            <SignDetail
              sign={selected}
              font={font}
              winkelhakenAngle={file.winkelhakenAngle}
              style={style}
              limits={limits}
              isReviewed={
                selected.shapes !== undefined &&
                reviewed.isReviewed(selected.text, selected.shapes)
              }
              onReviewedChange={(value) => markReviewed(selected, value)}
              onPrevious={() => step(-1)}
              onNext={() => step(1)}
              onClose={() => setSelectedKey("")}
            />
          </div>
        )}
      </div>
    </>
  )
}

/** How many tiles to draw at a time. */
const TILES_AT_A_TIME = 30

/**
 * How many of `total` tiles to draw: a few more each time the page is free,
 * so that drawing hundreds of tiles never holds up the controls. A new
 * `view`, such as another filter, starts again from a few.
 */
function useRevealed(total: number, view: string): number {
  const [state, setState] = useState({ view, count: TILES_AT_A_TIME })
  const count = state.view === view ? state.count : TILES_AT_A_TIME

  useEffect(() => {
    if (count >= total) return
    const timer = setTimeout(() =>
      setState({ view, count: count + TILES_AT_A_TIME }),
    )
    return () => clearTimeout(timer)
  }, [count, total, view])

  return count
}
