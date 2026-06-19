import React from "react";

import styles from "./Button.module.scss";

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
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  const classes = [styles.btn, styles[variant], styles[size], fullWidth ? styles.fullWidth : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      aria-haspopup={variant === "dropdown" || variant === "ghost-dropdown" ? "menu" : undefined}
      {...props}
    >
      {children}
      {(variant === "dropdown" || variant === "ghost-dropdown") && (
        <span className={styles.dropdownArrow} aria-hidden="true">
          ▼
        </span>
      )}
    </button>
  );
}
