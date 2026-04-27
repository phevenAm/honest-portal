import React from 'react';
import styles from './Avatar.module.scss';

type AvatarColor = 'teal' | 'sage' | 'stone' | 'sky' | 'clay';

interface AvatarProps {
  initials: string;
  color?:   AvatarColor;
  size?:    number;
}

export default function Avatar({ initials, color = 'teal', size = 40 }: AvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={`${styles.avatar} ${styles[color] ?? styles.teal}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials}
    </div>
  );
}
