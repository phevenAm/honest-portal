import type { MouseEvent } from "react";
import styles from "../Navbar/Navbar.module.scss";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function SkipToMain() {
  const handleSkip = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById("main-content");
    if (!main) return;
    const first = main.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (first ?? main).focus();
  };

  return (
    <a href="#main-content" className={styles.skipToMain} onClick={handleSkip}>
      Skip to main content
    </a>
  );
}
