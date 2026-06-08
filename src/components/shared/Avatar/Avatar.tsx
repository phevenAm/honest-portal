import { useState } from 'react';
import styles from './Avatar.module.scss';

type AvatarColor = 'teal' | 'sage' | 'stone' | 'sky' | 'clay';

interface AvatarProps {
  initials: string;
  color?:   AvatarColor;
  size?:    number;
  src?:     string;
}

export default function Avatar({ initials, color = 'teal', size = 40, src }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!src && !imgFailed;

  return (
    <div
      aria-hidden="true"
      className={`${styles.avatar} ${showImage ? '' : styles[color] ?? styles.teal}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {showImage ? (
        <img
          src={src}
          alt={initials}
          className={styles.avatarImg}
          onError={() => setImgFailed(true)}
        />
      ) : initials}
    </div>
  );
}
