import { useEffect, useState } from "react";

import Button from "@components/shared/Button/Button";
import Modal from "@components/shared/Modal/Modal";
import { supabase } from "@lib/supabase";
import type { Database } from "@models/database.types";

import styles from "../../AdminClientsPage.module.scss";

type AccessToken = Database["public"]["Tables"]["platform_access_token"]["Row"];

export default function ManageTokensModal({ onClose }: { onClose: () => void }) {
  const [allTokens, setAllTokens] = useState<AccessToken[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<AccessToken[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      const { data, error } = await supabase
        .from("platform_access_token")
        .select("id, token, is_used, created_at, expires_at, used_at")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setAllTokens(data ?? []);
      }
      setLoading(false);
    };

    fetchTokens();
  }, []);

  const handleDeleteToken = async (id: number) => {
    // TODO
  };

  const handleUpdateToken = async (id: number) => {
    // TODO
  };

  let modalBody = null;

  if (loading) {
    modalBody = <p className={styles.empty}>Loading...</p>;
  } else if (allTokens.length === 0) {
    modalBody = <p className={styles.empty}>No tokens yet.</p>;
  } else {
    modalBody = (
      <div className={styles.tokenTableWrap}>
        <div className={styles.tokenTableHeader}>
          <label className={styles.checkboxLabel} htmlFor="selectAll">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectedTokens.length === allTokens.length}
              onChange={() => {
                if (selectedTokens.length === allTokens.length) setSelectedTokens([]);
                else setSelectedTokens(allTokens.slice());
              }}
            />
            <span>{selectedTokens.length === allTokens.length ? "Deselect all" : "Select all"}</span>
          </label>

          {selectedTokens.length > 0 && (
            <div className={styles.bulkActions}>
              <Button variant="ghost" size="sm">
                Refresh selected
              </Button>
              <Button variant="danger" size="sm">
                Delete selected
              </Button>
            </div>
          )}
        </div>

        <ul className={styles.tokenList}>
          {allTokens.map((t) => (
            <li key={t.id} className={styles.tokenRow}>
              <input
                type="checkbox"
                className={styles.tokenCheckbox}
                checked={selectedTokens.some((st) => st.id === t.id)}
                onChange={() => {
                  const exists = selectedTokens.some((st) => st.id === t.id);
                  if (exists) setSelectedTokens(selectedTokens.filter((st) => st.id !== t.id));
                  else setSelectedTokens([...selectedTokens, t]);
                }}
              />
              <div className={styles.tokenMeta}>
                <span className={styles.tokenValue}>{t.token}</span>
                <span className={t.is_used ? styles.badgeUsed : styles.badgeAvailable}>
                  {t.is_used ? "Used" : "Available"}
                </span>
              </div>
              <div className={styles.tokenRowActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateToken(t.id)}
                  disabled={updatingId === t.id}
                >
                  {updatingId === t.id ? "..." : "Refresh"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteToken(t.id)}
                  disabled={deletingId === t.id}
                >
                  {deletingId === t.id ? "..." : "Delete"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );

    return (
      <Modal title="Manage Access Tokens" onClose={onClose} size="lg">
        {error && <p className={styles.modalError}>{error}</p>}
        {modalBody}
      </Modal>
    );
  }
}
