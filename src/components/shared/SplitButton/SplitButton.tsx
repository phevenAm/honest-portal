import React, { useState } from "react";

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
    { label: "Test Label", onClick: () => console.log("hi") },
    { label: "Test Label", onClick: () => console.log("hi") },
    { label: "Test Label", onClick: () => console.log("hi") },
    { label: "Test Label", onClick: () => console.log("hi") },
  ],
  primaryLabel = "placeholder primary label",
  secondaryLabel = "Open more otions",
}: ButtonProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const classes = [styles.btn, styles[variant], styles[size]].filter(Boolean).join(" ");
  return (
    <div className={[styles.buttonWrapper, isDropdownOpen ? styles.dropdownOpen : ""].filter(Boolean).join(" ")}>
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
      <div className={styles.secondaryDropdown}>
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
