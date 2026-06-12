import React, { useEffect } from "react";

import CloseIcon from "@mui/icons-material/Close";

import styles from "./Modal.module.scss";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export default function Modal({ title, onClose, children, actions }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss — keyboard handled via Escape in useEffect
    <div className={styles.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={styles.modalContainer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <h2 id="modal-title">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </button>
        </header>

        <main className={styles.modalBody}>
          <div className={styles.children}>{children}</div>
          {actions && <div className={styles.modalActions}>{actions}</div>}
        </main>
      </div>
    </div>
  );
}
