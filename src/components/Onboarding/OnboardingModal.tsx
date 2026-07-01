import { useMemo, useState } from "react";

import { KEYWORDS } from "@constants/constants";

import { pickColor } from "@Helpers/Helpers";

import { useAuth } from "../../context/AuthContext";
import Avatar from "../shared/Avatar/Avatar";
import Button from "../shared/Button/Button";
import UploadAndDisplayImage from "../shared/UploadAndDisplayImage/UploadAndDisplayImage";

import styles from "./OnboardingModal.module.scss";

interface Props {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: Props) {
  const { userProfile, updateProfile, isAdmin } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [nameInput, setNameInput] = useState(userProfile?.first_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const color = useMemo(() => pickColor(userProfile?.id ?? "a"), [userProfile?.id]);

  const toggleKeyword = (kw: string) =>
    setSelected((prev) => (prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]));

  const save = async (keywords: string[]) => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        display_name: nameInput.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        focus_keywords: keywords.length > 0 ? keywords : null,
        onboarding_completed: true,
      });
      onComplete();
    } catch {
      setSaveError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const stepContent = (() => {
    if (step === 1) {
      return (
        <>
          <div className={styles.textCenter}>
            <h2 className={styles.title}>Welcome, {userProfile?.first_name}!</h2>
            <p className={styles.subtitle}>
              Let's personalize your space. You can always update this later in your settings.
            </p>
          </div>

          <div className={styles.avatarPreview}>
            <Avatar name={nameInput} color={color} size={80} imageSrc={avatarUrl.trim()} />
          </div>

          <div className={styles.fields}>
            <label className={styles.label}>
              Display name
              <input
                className={styles.input}
                type="text"
                placeholder={userProfile?.first_name}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={40}
              />
            </label>

            <div className={styles.label}>
              Profile picture <span className={styles.optional}>(optional)</span>
              <UploadAndDisplayImage userId={userProfile?.id ?? ""} onUpload={(url) => setAvatarUrl(url)} />
            </div>
          </div>

          {isAdmin && saveError && <p className={styles.error}>{saveError}</p>}

          <div className={styles.actions}>
            {isAdmin ? (
              <Button variant="primary" onClick={() => save([])} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setStep(2)}>
                Next →
              </Button>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        <div className={styles.textCenter}>
          <h2 className={styles.title}>What would you like to focus on?</h2>
          <p className={styles.subtitle}>
            Pick topics that resonate — they shape the quotes you'll see. Skip to get the full range.
          </p>
        </div>

        <div className={styles.keywords}>
          {KEYWORDS.map((kw) => (
            <button
              key={kw}
              type="button"
              className={`${styles.chip} ${selected.includes(kw) ? styles.chipSelected : ""}`}
              onClick={() => toggleKeyword(kw)}
            >
              {kw}
            </button>
          ))}
        </div>

        {saveError && <p className={styles.error}>{saveError}</p>}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => save([])} disabled={saving}>
            Skip — show me everything
          </Button>
          <Button variant="primary" onClick={() => save(selected)} disabled={saving || selected.length === 0}>
            {saving ? "Saving…" : "Let's go"}
          </Button>
        </div>
      </>
    );
  })();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {!isAdmin && (
          <div className={styles.stepDots}>
            <span className={step === 1 ? styles.dotActive : styles.dot} />
            <span className={step === 2 ? styles.dotActive : styles.dot} />
          </div>
        )}

        {stepContent}
      </div>
    </div>
  );
}
