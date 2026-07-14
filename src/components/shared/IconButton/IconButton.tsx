import React from "react";

import styles from "./IconButton.module.scss";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "danger";
}

export default function IconButton({ icon, label, variant = "default", ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={[styles.iconButton, styles[variant]].join(" ")}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}
