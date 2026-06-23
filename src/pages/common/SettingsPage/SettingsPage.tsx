import { useEffect, useState } from "react";

import { KEYWORDS } from "@constants/constants";

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
  const [keywords, setKeywords] = useState<string[]>(userProfile?.focus_keywords ?? []);
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const avatarColor = userProfile?.id ? pickColor(userProfile.id) : "teal";

  useEffect(() => {
    setName(userProfile?.display_name ?? userProfile?.first_name ?? "");
    setImageUrl(userProfile?.avatar_url ?? "");
    setKeywords(userProfile?.focus_keywords ?? []);
  }, [userProfile]);

  const toggleKeyword = (kw: string) =>
    setKeywords((prev) => (prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]));

  const handleUpdateProfile = async () => {
    setSaving(true);
    await updateProfile({
      display_name: name,
      avatar_url: imageUrl,
      focus_keywords: keywords.length > 0 ? keywords : null,
    });
    setSaving(false);
  };

  return (
    <div className="page">
      <div className={`inner ${styles.columns}`}>
        <div className={styles.pageHeader}>
          <h1>Settings</h1>
          <p>Update or remove your profile</p>
        </div>

        <Card className={styles.card}>
          <div className={styles.topRow}>
            <section className={styles.left}>
              <form className={styles.form}>
                <h3>Edit Profile</h3>
                <div className={styles.field}>
                  <label htmlFor="displayName">Display name <small>shown on your dashboard — use a nickname or short name</small></label>
                  <input
                    id="displayName"
                    onChange={(e) => setName(e.target.value)}
                    maxLength={40}
                    value={name}
                    placeholder="e.g. Alex"
                    name="display name"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="profilePicture">Profile picture URL</label>
                  <input
                    id="profilePicture"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    name="profile picture URL"
                  />
                </div>
              </form>
            </section>

            <section className={styles.right}>
              <div className={styles.avatarCard}>
                <Avatar name={name} imageSrc={imageUrl} color={avatarColor} size={210} />
                <h2>{name}</h2>
              </div>
            </section>
          </div>

          {!isAdmin && (
            <section className={styles.keywords}>
              <h3>Focus keywords</h3>
              <p>Pick topics that shape the quotes you see on your dashboard.</p>
              <div className={styles.chipList}>
                {KEYWORDS.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    className={`${styles.chip} ${keywords.includes(kw) ? styles.chipSelected : ""}`}
                    onClick={() => toggleKeyword(kw)}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className={styles.actions}>
            <Button
              variant="primary"
              className={styles.saveButton}
              onClick={async (e) => {
                e.preventDefault();
                await handleUpdateProfile();
              }}
            >
              {saving ? "Updating profile..." : "Update profile"}
            </Button>
            {!isAdmin && (
              <div className={styles.deleteAccountBlock}>
                <Button variant="ghost-danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                  Delete account
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {isDeleteModalOpen && <DeleteUserModal onClose={() => setIsDeleteModalOpen(false)} />}
    </div>
  );
};

export default SettingsPage;
