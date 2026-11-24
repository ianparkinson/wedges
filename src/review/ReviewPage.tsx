import type { Font } from "opentype.js"
import { useEffect, useMemo, useState } from "react"

import type { OslData, SkeletonFile } from "@/core/types"
import { useUrlState } from "@/ui/hooks/useUrlState"

import { skeletonFonts } from "./redraw/fonts"
import { skeletonFiles, useFont, useOsl } from "./reviewData"
import styles from "./ReviewPage.module.css"
import { reviewSigns } from "./reviewSigns"
import { SignTile } from "./SignTile"
import { Choice } from "./ui/Choice"

const DEFAULT_FILE = "noto-next"

/**
 * The review page: every glyph in a skeleton file's font with its skeleton
 * drawn over it. See docs/review-tooling.md.
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

const GROUPS = ["all", "simple", "modified", "compound", "unlisted"]
const BLOCKS = ["all", "main", "numbers", "earlyDynastic"]

interface LoadedReviewProps {
  fileId: string
  file: SkeletonFile
  font: Font
  osl: OslData
}

function LoadedReview({ fileId, file, font, osl }: LoadedReviewProps) {
  const { style } = skeletonFonts[fileId]!
  const [group, setGroup] = useUrlState("group", "all")
  const [block, setBlock] = useUrlState("block", "all")

  const signs = useMemo(() => reviewSigns(file, font, osl), [file, font, osl])
  const shown = useMemo(
    () =>
      signs.filter(
        (sign) =>
          (group === "all" || sign.group === group) &&
          (block === "all" || sign.block === block),
      ),
    [signs, group, block],
  )
  const revealed = useRevealed(shown.length, [group, block].join("|"))
  const grid = shown.slice(0, revealed)

  const counts = {
    glyphs: signs.length,
    traced: signs.filter((sign) => sign.shapes).length,
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
        <p className={styles.counts}>
          {counts.glyphs} glyphs, {counts.traced} traced. Showing {shown.length}
          .
        </p>
      </div>
      <ul className={styles.grid}>
        {grid.map((sign) => (
          <li key={sign.key}>
            <SignTile
              sign={sign}
              font={font}
              winkelhakenAngle={file.winkelhakenAngle}
              style={style}
            />
          </li>
        ))}
      </ul>
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
