import React from "react";

import styles from "./Card.module.scss";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
}

export default function Card({ children, style, className = "", onClick, ...props }: CardProps) {
  const classes = [styles.card, onClick ? styles.clickable : "", className].filter(Boolean).join(" ");

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick(e) : undefined}
      className={classes}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
