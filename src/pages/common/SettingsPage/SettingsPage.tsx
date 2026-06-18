import React, { useEffect, useState } from "react";

import { pickColor } from "@Helpers/Helpers";
import Avatar from "@components/shared/Avatar/Avatar";
import Button from "@components/shared/Button/Button";
import Card from "@components/shared/Card/Card";
import { useAuth } from "@context/AuthContext";

import DeleteUserModal from "./DeleteUserModal/DeleteUserModal";

import styles from "./SettingsPage.module.scss";

const SettingsPage = () => {
  const { userProfile, updateProfile, isAdmin } = useAuth();
  const [name, setName] = useState(userProfile?.display_name ?? "");
  const [imageUrl, setImageUrl] = useState(userProfile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    <div className="page">
      <div className={`inner ${styles.columns}`}>
        <div className={styles.pageHeader}>
          <h1>Settings</h1>
          <p>Update or remove your profile</p>
        </div>
        <Card className={styles.sectionsContainer}>
          <section className={styles.left}>
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

              <Button
                type="submit"
                className={styles.saveButton}
                onClick={async (e) => {
                  e.preventDefault();
                  await handleUpdateProfile();
                }}
              >
                {saving ? "Updating profile..." : "Update profile"}
              </Button>
            </form>

            <div className={styles.deleteAccountBlock}>
              {!isAdmin && (
                <Button type="button" onClick={() => setIsDeleteModalOpen(true)}>
                  Delete account
                </Button>
              )}
            </div>
            {isDeleteModalOpen && (
              <DeleteUserModal
                onClose={() => setIsDeleteModalOpen(false)}
                // modalTitle="Delete your account forever?"
                // idToDelete={userProfile?.id ?? ""} //! can all be set internally in the modal, no need to pass as props
                // bodyText={"test"}
              ></DeleteUserModal>
            )}
          </section>
          <section className={styles.right}>
            <div className={styles.avatarCard}>
              <Avatar name={name} imageSrc={imageUrl} color={avatarColor} size={150} />
              <h2>{name}</h2>
            </div>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
