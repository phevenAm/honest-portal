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
  }, []);
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2>{title}</h2>
          <a onClick={onClose}>
            <CloseIcon />
          </a>
        </header>

        <main className={styles.modalBody}>
          <div className={styles.children}>{children}</div>
          {actions && <div className={styles.modalActions}>{actions}</div>}
        </main>
      </div>
    </div>
  );
}
