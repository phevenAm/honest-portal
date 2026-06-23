import { useState } from "react";

import Button from "@components/shared/Button/Button";
import Modal from "@components/shared/Modal/Modal";
import { useAuth } from "@context/AuthContext";
import { supabase } from "@lib/supabase";

import type { ClientStub } from "../../AdminClientsPage";
import styles from "../../AdminClientsPage.module.scss";

type Props = {
  onClose: () => void;
  onCreated: (stub: ClientStub) => void;
};

export default function CreateClientProfileModal({ onClose, onCreated }: Props) {
  const { userProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !userProfile) return;
    setSaving(true);
    setError("");

    const { data, error } = await supabase
      .from("client_stubs")
      .insert({
        created_by: userProfile.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
      })
      .select("id, first_name, last_name, email, linked_user_id, created_at")
      .single();

    if (error) {
      setError(error.message);
    } else {
      onCreated(data);
      onClose();
    }
    setSaving(false);
  };

  return (
    <Modal
      title="Create client profile"
      onClose={onClose}
      actions={
        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !firstName.trim() || !lastName.trim()}>
            {saving ? "Creating…" : "Create profile"}
          </Button>
        </div>
      }
    >
      {error && <p className={styles.modalError}>{error}</p>}
      <p className={styles.modalText}>
        Create an offline client profile. You can link it to a real account later once they sign up.
      </p>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label htmlFor="stub-first">First name *</label>
          <input
            id="stub-first"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="stub-last">Last name *</label>
          <input
            id="stub-last"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="stub-email">Email (optional)</label>
        <input
          id="stub-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="client@example.com"
        />
      </div>
    </Modal>
  );
}
