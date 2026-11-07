import type { ReactNode } from "react"
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components"

import { Button } from "../Button/Button"
import styles from "./Sheet.module.css"

/** Props for {@link Sheet}. */
export interface SheetProps {
  isOpen: boolean
  /** Called when the sheet is closed by its Close button, Escape, or a tap outside it. */
  onClose: () => void
  /** The sheet's heading, which is also its accessible name. */
  title: string
  children: ReactNode
}

/**
 * A modal panel over the app, with a heading and a Close button. It fills a
 * phone's screen, and is a column down the middle of a wider one. Focus stays
 * inside it while it is open, and goes back where it was when it closes.
 */
export function Sheet({ isOpen, onClose, title, children }: SheetProps) {
  return (
    <ModalOverlay
      className={styles.overlay}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      isDismissable
    >
      <Modal className={styles.sheet}>
        <Dialog className={styles.dialog}>
          <header className={styles.header}>
            <Heading slot="title" className={styles.title}>
              {title}
            </Heading>
            <Button onPress={onClose}>Close</Button>
          </header>
          <div className={styles.body}>{children}</div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
