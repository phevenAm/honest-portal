import { useEffect, useState } from "react";

import Button from "@components/shared/Button/Button";
import Modal from "@components/shared/Modal/Modal";
import { useAuth } from "@context/AuthContext";
import { useToast } from "@context/ToastContext";
import { supabase } from "@lib/supabase";
import type { UserProfile } from "@models/globalTypes";

import styles from "../../AdminClientsPage.module.scss";

type SessionNote = {
  id: string;
  content: string;
  created_at: string;
};

type Props = {
  user: UserProfile;
  onClose: () => void;
};

export default function SessionNotesModal({ user, onClose }: Props) {
  const { userProfile, isDemo } = useAuth();
  const { showToast } = useToast();
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("session_notes")
        .select("id, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setNotes(data ?? []);
      setLoading(false);
    };

    fetchNotes();
  }, [user.id]);

  const handleAdd = async () => {
    if (isDemo) {
      showToast("Demo mode — changes are not saved.");
      return;
    }
    if (!content.trim() || !userProfile) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("session_notes")
      .insert({ admin_id: userProfile.id, user_id: user.id, content: content.trim() })
      .select("id, content, created_at")
      .single();

    if (error) setError(error.message);
    else {
      setNotes((prev) => [data, ...prev]);
      setContent("");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (isDemo) {
      showToast("Demo mode — changes are not saved.");
      return;
    }
    setDeletingId(id);
    const { error } = await supabase.from("session_notes").delete().eq("id", id);
    if (error) setError(error.message);
    else setNotes((prev) => prev.filter((n) => n.id !== id));
    setDeletingId(null);
  };

  let notesSection;

  if (loading) {
    notesSection = <p className={styles.empty}>Loading…</p>;
  } else if (notes.length === 0) {
    notesSection = <p className={styles.empty}>No notes yet.</p>;
  } else {
    notesSection = (
      <ul className={styles.notesList}>
        {notes.map((note) => (
          <li key={note.id} className={styles.noteItem}>
            <div className={styles.noteHeader}>
              <span className={styles.noteDate}>
                {new Date(note.created_at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(note.id)}
                disabled={isDemo || deletingId === note.id}
                aria-label="Delete note"
              >
                {deletingId === note.id ? "…" : "Delete"}
              </Button>
            </div>
            <p className={styles.noteContent}>{note.content}</p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Modal title={`Notes — ${user.first_name} ${user.last_name}`} onClose={onClose} size="md">
      {error && <p className={styles.modalError}>{error}</p>}

      <div className={styles.notesAddForm}>
        <textarea
          className={styles.notesTextarea}
          placeholder="Add a session note…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <div className={styles.notesFormActions}>
          <Button size="sm" onClick={handleAdd} disabled={saving || !content.trim()}>
            {saving ? "Saving…" : "Add note"}
          </Button>
        </div>
      </div>

      {notesSection}
    </Modal>
  );
}
