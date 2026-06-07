import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../shared/Avatar/Avatar";
import Button from "../shared/Button/Button";
import styles from "./OnboardingModal.module.scss";

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

const AVATAR_COLORS = ["teal", "sage", "stone", "sky", "clay"] as const;
type AvatarColor = (typeof AVATAR_COLORS)[number];

function pickColor(userId: string): AvatarColor {
  return AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];
}

function buildInitials(displayName: string, firstName: string, lastName: string): string {
  const name = displayName.trim() || `${firstName} ${lastName}`;
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface Props {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: Props) {
  const { userProfile, updateProfile } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState(userProfile?.first_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const color = useMemo(() => pickColor(userProfile?.id ?? "a"), [userProfile?.id]);
  const initials = buildInitials(displayName, userProfile?.first_name ?? "", userProfile?.last_name ?? "");

  const toggleKeyword = (kw: string) =>
    setSelected((prev) => (prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]));

  const save = async (keywords: string[]) => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        display_name: displayName.trim() || null,
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

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.stepDots}>
          <span className={step === 1 ? styles.dotActive : styles.dot} />
          <span className={step === 2 ? styles.dotActive : styles.dot} />
        </div>

        {step === 1 ? (
          <>
            <div className={styles.textCenter}>
              <h2 className={styles.title}>Welcome, {userProfile?.first_name}!</h2>
              <p className={styles.subtitle}>
                Let's personalize your space. You can always update this later.
              </p>
            </div>

            <div className={styles.avatarPreview}>
              <Avatar
                initials={initials}
                color={color}
                size={80}
                src={avatarUrl.trim() || undefined}
              />
            </div>

            <div className={styles.fields}>
              <label className={styles.label}>
                Display name
                <input
                  className={styles.input}
                  type="text"
                  placeholder={userProfile?.first_name}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={40}
                />
              </label>

              <label className={styles.label}>
                Profile picture URL{" "}
                <span className={styles.optional}>(optional)</span>
                <input
                  className={styles.input}
                  type="url"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </label>
            </div>

            <div className={styles.actions}>
              <Button variant="primary" onClick={() => setStep(2)}>
                Next →
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.textCenter}>
              <h2 className={styles.title}>What would you like to focus on?</h2>
              <p className={styles.subtitle}>
                Pick topics that resonate — they shape the quotes you'll see.
                Skip to get the full range.
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
              <Button
                variant="primary"
                onClick={() => save(selected)}
                disabled={saving || selected.length === 0}
              >
                {saving ? "Saving…" : "Let's go"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
