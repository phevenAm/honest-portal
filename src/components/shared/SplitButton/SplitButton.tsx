import React, { useEffect, useRef, useState } from "react";

import { ChevronDown } from "../Icons/Icons";

import styles from "./SplitButton.module.scss";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "ghost-danger"
  | "dropdown"
  | "ghost-dropdown"
  | "link"
  | "ghost-link";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  primaryAction: () => void;
  options: { label: string; onClick: () => void }[];
  primaryLabel: string;
  secondaryLabel: string;
}

const SplitButton = ({
  variant = "primary",
  size = "md",
  primaryAction,
  options = [
    { label: "Test Labeasd", onClick: () => console.log("hi") },
    { label: "Test Labaasdssdel", onClick: () => console.log("hi") },
    { label: "Test Lasdabel", onClick: () => console.log("hi") },
    { label: "Test Label", onClick: () => console.log("hi") },
  ],
  primaryLabel = "placeholder primary label",
  secondaryLabel = "Open more otions",
}: ButtonProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const classes = [styles.btn, styles[variant], styles[size]].filter(Boolean).join(" ");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | KeyboardEvent) => {
      //!move here to remove infinite re-renders
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={[styles.buttonWrapper, isDropdownOpen ? styles.dropdownOpen : ""].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        className={[classes, styles.mainButton].filter(Boolean).join(" ")}
        onClick={() => primaryAction()}
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        className={[styles.secondaryButton, classes].filter(Boolean).join(" ")}
        aria-label={secondaryLabel}
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        <ChevronDown />
      </button>
      <div className={[styles.secondaryDropdown, isDropdownOpen ? styles.meh : ""].filter(Boolean).join(" ")}>
        {isDropdownOpen && (
          <ul>
            {options?.map(({ label, onClick }) => {
              return (
                <li key={label}>
                  <button type="button" className={styles.labelButton} onClick={onClick}>
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SplitButton;
