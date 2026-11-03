import { Link } from '@/ui/Link/Link'

import styles from './App.module.css'

const REPO_URL = 'https://github.com/ianparkinson/wedges'

/**
 * The app shell. For now this is a placeholder page, so the deploy pipeline
 * has something to publish; the drawing pad and lookup arrive in later
 * milestones (see docs/decisions/0001-stack.md).
 */
export function App() {
  return (
    <main className={styles.page}>
      {/* AN, the sign for "sky" or "god", as a decorative mark. */}
      <p className={styles.glyph} aria-hidden="true">
        𒀭
      </p>
      <h1 className={styles.title}>Wedges</h1>
      <p className={styles.lede}>
        Find cuneiform signs by drawing them, or look them up in the Oracc Sign
        List.
      </p>
      <p className={styles.status}>
        Wedges is being built. Follow along on{' '}
        <Link href={REPO_URL}>GitHub</Link>.
      </p>
    </main>
  )
}
