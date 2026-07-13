import { useState } from "react";
import styles from "./ToggleButtonTabs.module.scss";

export type ToggleButtonTabsTypes = {
  leftButtonTitle: string;
  leftButtonAction: () => void;
  rightButtonTitle: string;
  rightButtonAction: () => void;
};
export type toggleTypes = "left" | "right";
const ToggleButtonTabs = ({
  leftButtonTitle,
  rightButtonTitle,
  leftButtonAction,
  rightButtonAction,
}: ToggleButtonTabsTypes) => {
  const [activeButton, setActiveButton] = useState<toggleTypes>("left");
  return (
    <div className={styles.sessionTabs}>
      <button
        type="button"
        className={activeButton === "left" ? styles.sessionTabActive : styles.sessionTab}
        onClick={() => {
          setActiveButton("left");
          leftButtonAction();
        }}
      >
        {leftButtonTitle}
      </button>
      <button
        type="button"
        className={activeButton === "right" ? styles.sessionTabActive : styles.sessionTab}
        onClick={() => {
          setActiveButton("right");
          rightButtonAction();
        }}
      >
        {rightButtonTitle}
      </button>
    </div>
  );
};

export default ToggleButtonTabs;
