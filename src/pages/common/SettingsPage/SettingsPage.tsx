import { useEffect, useState } from "react";

import { KEYWORDS } from "@constants/constants";

import { isPageStatusLoading, pickColor } from "@Helpers/Helpers";
import Avatar from "@components/shared/Avatar/Avatar";
import Button from "@components/shared/Button/Button";
import Card from "@components/shared/Card/Card";
import UploadAndDisplayImage from "@components/shared/UploadAndDisplayImage/UploadAndDisplayImage";
import { useAuth } from "@context/AuthContext";
import { useToast } from "@context/ToastContext";

import Spinner from "@/components/shared/Spinner/Spinner";
import { supabase } from "@/lib/supabase";
import DeleteUserModal from "./DeleteUserModal/DeleteUserModal";

import styles from "./SettingsPage.module.scss";

const BUSINESS_FIELDS = [
  { key: "business_name", label: "Business name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
] as const;

type BusinessField = (typeof BUSINESS_FIELDS)[number]["key"];

const SettingsPage = () => {
  const { userProfile, updateProfile, isAdmin, isDemo, loading } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(userProfile?.display_name ?? "");
  const [imageUrl, setImageUrl] = useState(userProfile?.avatar_url ?? "");
  const [keywords, setKeywords] = useState<string[]>(userProfile?.focus_keywords ?? []);
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [practiceDetails, setPracticeDetails] = useState<Record<BusinessField, string>>({
    business_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [logoUrl, setLogoUrl] = useState("");
  const [savingBusiness, setSavingBusiness] = useState(false);

  const avatarColor = userProfile?.id ? pickColor(userProfile.id) : "teal";

  useEffect(() => {
    setName(userProfile?.display_name ?? userProfile?.first_name ?? "");
    setImageUrl(userProfile?.avatar_url ?? "");
    setKeywords(userProfile?.focus_keywords ?? []);
  }, [userProfile]);

  useEffect(() => {
    if (!isAdmin || !userProfile?.id) return;
    supabase
      .from("practice_settings")
      .select("*")
      .eq("admin_id", userProfile.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPracticeDetails(data as Record<BusinessField, string>);
          setLogoUrl(data.logo_url ?? "");
        }
      });
  }, [isAdmin, userProfile?.id]);

  const toggleKeyword = (kw: string) =>
    setKeywords((prev) => (prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]));

  const handleUpdateProfile = async () => {
    if (isDemo) {
      showToast("Demo mode — changes are not saved.");
      return;
    }
    setSaving(true);
    await updateProfile({
      display_name: name,
      avatar_url: imageUrl,
      focus_keywords: keywords.length > 0 ? keywords : null,
    });
    setSaving(false);
  };

  const handleUpdateBusiness = async () => {
    if (!userProfile?.id) return;
    setSavingBusiness(true);
    await supabase
      .from("practice_settings")
      .update({ ...practiceDetails, logo_url: logoUrl || null })
      .eq("admin_id", userProfile.id);
    setSavingBusiness(false);
    showToast("Business information updated.");
  };

  // const guard = isPageStatusLoading();
  // if (guard) return guard;
  if (loading || !userProfile)
    return (
      <div className="page">
        <Spinner />
      </div>
    );

  return (
    <div className="page">
      <div className={`inner ${styles.columns}`}>
        <div className={styles.pageHeader}>
          <h1>Settings</h1>
          <p>{isAdmin ? "Update your profile and business information" : "Update or remove your profile"}</p>
        </div>

        {/* ── Profile card ── */}
        <Card className={styles.card}>
          <div className={styles.topRow}>
            <section className={styles.left}>
              <form className={styles.form}>
                <h3 className={styles.sectionTitle}>Edit profile</h3>
                <div className={styles.field}>
                  <label htmlFor="displayName">
                    Display name <small>(shown on your dashboard — use a nickname or short name)</small>
                  </label>
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
                  <label>Profile picture</label>
                  <UploadAndDisplayImage userId={userProfile?.id ?? ""} onUpload={(url) => setImageUrl(url)} />
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
            {!isAdmin && !isDemo && (
              <div className={styles.deleteAccountBlock}>
                <Button variant="ghost-danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                  Delete account
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* ── Business info card (admin only) ── */}
        {isAdmin && (
          <Card className={styles.card}>
            <section className={styles.businessSection}>
              <h3>Business information</h3>
              <p>This information can be used across the app and in client communications.</p>
              <form className={styles.form}>
                {BUSINESS_FIELDS.map(({ key, label }) => (
                  <div className={styles.field} key={key}>
                    <label>{label}</label>
                    <input
                      value={practiceDetails[key] ?? ""}
                      onChange={(e) => setPracticeDetails((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className={styles.field}>
                  <label>Logo</label>
                  {logoUrl ? (
                    <>
                      <img src={logoUrl} alt="Practice logo" className={styles.logoPreview} />
                      <Button variant="ghost-danger" size="sm" onClick={() => setLogoUrl("")}>
                        Remove logo
                      </Button>
                    </>
                  ) : (
                    <UploadAndDisplayImage
                      userId={userProfile?.id ?? ""}
                      bucket="logos"
                      onUpload={(url) => setLogoUrl(url)}
                    />
                  )}
                </div>
              </form>
            </section>
            <div className={styles.actions}>
              <Button variant="primary" className={styles.saveButton} onClick={handleUpdateBusiness}>
                {savingBusiness ? "Saving…" : "Save business info"}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {isDeleteModalOpen && <DeleteUserModal onClose={() => setIsDeleteModalOpen(false)} />}
    </div>
  );
};

export default SettingsPage;
