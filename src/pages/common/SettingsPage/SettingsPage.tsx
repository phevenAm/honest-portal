import React, { useState, useEffect } from "react";

import { pickColor } from "@Helpers/Helpers";
import { useAuth } from "@context/AuthContext";
import Avatar from "@components/shared/Avatar/Avatar";

import styles from "./SettingsPage.module.scss";

const SettingsPage = () => {
  const { userProfile, updateProfile } = useAuth();
  const [name, setName] = useState(userProfile?.display_name ?? "");
  const [imageUrl, setImageUrl] = useState(userProfile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);

  const avatarColor = userProfile?.id ? pickColor(userProfile.id) : "teal";

  useEffect(() => {
    setName(userProfile?.display_name ?? userProfile?.first_name ?? "");
    setImageUrl(userProfile?.avatar_url ?? "");
  }, [userProfile]);

  const handleUpdateProfile = async () => {
    setSaving(true);
    await updateProfile({ display_name: name, avatar_url: imageUrl });
    setSaving(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.left}>
          <div className={styles.pageHeader}>
            <h1>Settings</h1>
            <p>Update or remove your profile</p>
          </div>
          <form>
            <legend>
              <label htmlFor="displayName">Display name</label>
              <input
                id="displayName"
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                value={name}
                name="display name"
              />
            </legend>
            <legend>
              <label htmlFor="profilePicture">Profile picture URL</label>
              <input
                id="profilePicture"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                name="profile picture URL"
              />
            </legend>

            <button
              type="submit"
              className={styles.saveButton}
              onClick={async (e) => {
                e.preventDefault();
                await handleUpdateProfile();
              }}
            >
              {saving ? "Updating profile..." : "Update profile"}
            </button>
          </form>

          <div className={styles.deleteAccountBlock}>delete account block</div>
        </section>
        <section className={styles.right}>
          <Avatar name={name} imageSrc={imageUrl} color={avatarColor} size={150} />
          <h2>{name}</h2>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
