import React, { useState, useEffect } from "react";
import styles from "../SettingsPage/SettingsPage.module.scss";
import Avatar from "@/components/shared/Avatar/Avatar";
import { useAuth } from "@context/AuthContext";

const SettingsPage = () => {
  const avatarDetails = {
    //!get these from api, so use effect to fetch
    name: "John Doe",
    imageUrl: "https://www.pexels.com/photo/my-lounge-living-room-27383726/",
    initials: "JD",
  };

  const [name, setName] = useState(avatarDetails.name);
  const [imageUrl, setImageUrl] = useState(avatarDetails.imageUrl);

  //!duplicated from onboarding modal! TODO: refactor soon
  const KEYWORDS = [
    "love",
    "hope",
    "forgiveness",
    "self-love",
    "worth",
    "peace",
    "friendship",
    "strength",
    "growth",
    "healing",
    "courage",
    "mindfulness",
    "gratitude",
    "resilience",
  ];
  //!duplicated from onboarding modal! TODO: refactor soon
  const AVATAR_COLORS = ["teal", "sage", "stone", "sky", "clay"] as const;
  type AvatarColor = (typeof AVATAR_COLORS)[number];
  //!duplicated from onboarding modal! TODO: refactor soon
  function pickColor(userId: string): AvatarColor {
    return AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];
  }

  const { isAdmin } = useAuth();

  useEffect(() => {
    console.log("loaded", isAdmin);
    console.log(useAuth);
  }, []);

  //!help me practice implementhing things to stop rerendering

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.left}>
          <div className={styles.pageHeader}>
            <h1> Settings</h1>
            <p>Update or remove your profile</p>
          </div>
          <form>
            <legend>
              <label for="displayName">Display name</label>
              <input id="displayName" name="display name" />
            </legend>
            <legend>
              <label for="profilePicture">Profile picture URL</label>
              <input id="profilePicture" name="profile picture URL" />
            </legend>
          </form>
          <div className={styles.deleteAccountBlock}>delete account block</div>
        </section>
        <section className={styles.right}>
          <Avatar {...avatarDetails} />
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
