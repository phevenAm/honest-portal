import { useState } from "react";

import { type AvatarColor, getInitials } from "@Helpers/Helpers";

import styles from "./Avatar.module.scss";

interface AvatarProps {
  name: string;
  color?: AvatarColor;
  size?: number;
  imageSrc?: string;
}

export default function Avatar({ name, color = "teal", size = 40, imageSrc = "" }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!imageSrc && !imgFailed;

  const initials = getInitials(name);

  return (
    <div
      aria-hidden="true"
      className={`${styles.avatar} ${showImage ? "" : (styles[color] ?? styles.teal)}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {showImage ? (
        <img src={imageSrc} alt={"User Avatar"} className={styles.avatarImg} onError={() => setImgFailed(true)} />
      ) : (
        initials
      )}
    </div>
  );
}
