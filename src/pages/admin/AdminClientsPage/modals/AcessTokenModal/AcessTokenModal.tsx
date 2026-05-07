import { useState } from "react";
import Card from "../../../../../components/shared/Card/Card";

import {generateAccessToken} from "../../hooks/UseAdminClientsPage";
import Button from "../../../../../components/shared/Button/Button";
import { supabase } from "../../../../../lib/supabase";
import styles from "../../AdminClientsPage.module.scss";


export default function AccessTokenModal({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState(generateAccessToken());
  const [createdToken, setCreatedToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    const cleanedToken = token.trim();
    setError("");
    setCopied(false);

    if (!cleanedToken) {
      setError("Token cannot be empty");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("platform_access_token")
      .insert({ token: cleanedToken, is_used: false })
      .select("token")
      .single();

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setCreatedToken(data.token);
  };

  const handleCopy = async () => {
    if (!createdToken) return;

    try {
      await navigator.clipboard.writeText(createdToken);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <Card className={styles.modal}>
        <h3 className={styles.modalTitle}>Create client access token</h3>
        <p className={styles.modalText}>
          Give this token to a client. They must enter it during sign up before
          an account can be created.
        </p>

        {error && <p className={styles.modalError}>{error}</p>}

        {!createdToken ? (
          <>
            <div className={styles.field}>
              <label htmlFor="access-token">Access token</label>
              <input
                id="access-token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
              />
            </div>

            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? "Creating…" : "Create token"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.generatedTokenBox}>
              <p className={styles.generatedTokenLabel}>Token created</p>
              <p className={styles.generatedToken}>{createdToken}</p>
            </div>

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={handleCopy}>
                {copied ? "Copied" : "Copy token"}
              </Button>
              <Button onClick={onClose}>Done</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
