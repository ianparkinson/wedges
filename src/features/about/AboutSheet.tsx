import type { Stroke } from "@/core/strokes"
import type { Point } from "@/lib/geometry"
import { Link } from "@/ui/Link/Link"
import { Sheet } from "@/ui/Sheet/Sheet"

import styles from "./AboutSheet.module.css"
import { StrokeDiagram } from "./StrokeDiagram"

const REPO_URL = "https://github.com/ianparkinson/wedges"
// Any query parameter skips the page that offers issue templates.
const ISSUES_URL = `${REPO_URL}/issues/new?title=`
const DISCUSSIONS_URL = `${REPO_URL}/discussions/new/choose`
const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`
const OSL_URL = "https://oracc.museum.upenn.edu/osl/"
const NOTO_URL = "https://fonts.google.com/noto/specimen/Noto+Sans+Cuneiform"
const OFL_URL = "https://openfontlicense.org/"

// The diagrams' strokes and finger paths, in StrokeDiagram's 120 × 80 units.
// Each path runs beside its stroke, in the direction it is drawn.
const WEDGE: Stroke = {
  kind: "wedge",
  head: { x: 14, y: 30 },
  tail: { x: 106, y: 30 },
}
const WEDGE_PATH: readonly Point[] = [
  { x: 14, y: 60 },
  { x: 100, y: 60 },
]
const WINKELHAKEN: Stroke = {
  kind: "winkelhaken",
  vertex: { x: 50, y: 40 },
  legA: { x: 104, y: 12 },
  legB: { x: 104, y: 68 },
}
const WINKELHAKEN_PATH: readonly Point[] = [
  { x: 76, y: 10 },
  { x: 22, y: 40 },
  { x: 76, y: 70 },
]

/** Props for {@link AboutSheet}. */
export interface AboutSheetProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * About Wedges: how to draw a wedge and a Winkelhaken, where the source code
 * is, and the licences of the code and the data and font it uses.
 */
export function AboutSheet({ isOpen, onClose }: AboutSheetProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="About Wedges">
      <div className={styles.content}>
        <section className={styles.section}>
          <h3 className={styles.heading}>Drawing a sign</h3>
          <p className={styles.text}>
            Draw a sign on the pad one stroke at a time, in any order. The signs
            that match best appear under the pad: tap one to add it to your
            text, or tap Accept for the first.
          </p>
          <div className={styles.stroke}>
            <StrokeDiagram stroke={WEDGE} path={WEDGE_PATH} />
            <p className={styles.text}>
              <strong>A wedge:</strong> put your finger down where its head, the
              wide end, should be, and drag towards its tail.
            </p>
          </div>
          <div className={styles.stroke}>
            <StrokeDiagram stroke={WINKELHAKEN} path={WINKELHAKEN_PATH} />
            <p className={styles.text}>
              <strong>A Winkelhaken:</strong> draw it like a &lt;, from the end
              of one arm to the point and out along the other, without lifting
              your finger.
            </p>
          </div>
          <p className={styles.text}>
            If you know a sign&apos;s name or one of its values, Look up finds
            it too.
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>Source code and feedback</h3>
          <p className={styles.text}>
            Wedges is open source, and its code is on{" "}
            <Link href={REPO_URL}>GitHub</Link>. If something doesn&apos;t work,{" "}
            <Link href={ISSUES_URL}>report a bug</Link>. For questions and
            suggestions, <Link href={DISCUSSIONS_URL}>start a discussion</Link>.
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>Licences</h3>
          <ul className={styles.list}>
            <li>
              Wedges is released under the{" "}
              <Link href={LICENSE_URL}>MIT licence</Link>.
            </li>
            <li>
              Sign names and values come from the{" "}
              <Link href={OSL_URL}>Oracc Sign List</Link>, released under CC0.
            </li>
            <li>
              Signs are shown in{" "}
              <Link href={NOTO_URL}>Noto Sans Cuneiform</Link>, under the{" "}
              <Link href={OFL_URL}>SIL Open Font License</Link>.
            </li>
          </ul>
        </section>
      </div>
    </Sheet>
  )
}
