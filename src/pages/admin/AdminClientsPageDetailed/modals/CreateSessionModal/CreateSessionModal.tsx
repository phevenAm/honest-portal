import { useState } from "react";

import { DateTimePicker } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";

import Button from "@components/shared/Button/Button";
import Modal from "@components/shared/Modal/Modal";

import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { createSession } from "@/store/slices/sessionsSlice";

import styles from "./CreateSessionModal.module.scss";

type CreateSessionModalTypes = {
  id: string;
  clientName: string;
  onClose: () => void;
};

const CreateSessionModal = ({ id, onClose, clientName }: CreateSessionModalTypes) => {
  const { authUser } = useAuth();
  const dispatch = useAppDispatch();
  const [scheduledAt, setScheduledAt] = useState<Dayjs | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(3);
  const [sessionDuration, setSessionDuration] = useState(50);
  const [isPrepaid, setIsPrepaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!authUser || !scheduledAt) return;
    setIsSaving(true);
    setError("");

    const dates = [scheduledAt];
    if (isRecurring) {
      for (let i = 1; i <= recurringWeeks; i++) {
        dates.push(scheduledAt.add(i, "week"));
      }
    }

    const result = await Promise.all(
      dates.map((date) =>
        dispatch(
          createSession({
            client_id: id,
            scheduled_at: date.toISOString(),
            paid: isPrepaid,
            duration_minutes: sessionDuration,
            notes: notes.trim() || undefined,
            created_by: authUser.id,
          }),
        ),
      ),
    );

    const allSuccess = result.every((i) => i?.meta.requestStatus === "fulfilled");

    if (allSuccess) {
      onClose();
    } else {
      setError("Failed to schedule session. Please try again.");
    }
    setIsSaving(false);
  };

  return (
    <Modal
      title={`Schedule session — ${clientName}`}
      onClose={onClose}
      size="sm"
      actions={
        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!scheduledAt || isSaving}>
            {/** biome-ignore lint/style/noNestedTernary: <explanation> */}
            {isSaving ? "Scheduling…" : isRecurring ? "Schedule sessions" : "Schedule session"}
          </Button>
        </div>
      }
    >
      <div className={styles.form}>
        <div className={styles.fieldGroup}>
          <DateTimePicker
            label="Date & time"
            value={scheduledAt}
            onChange={(val) => setScheduledAt(val)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="session-duration">
            Session duration
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="session-duration"
              className={styles.input}
              type="number"
              min={10}
              max={90}
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.checkboxGroup}>
          <input
            id="recurring"
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          <label htmlFor="recurring" className={styles.checkboxLabel}>
            Repeat weekly
          </label>
        </div>

        {isRecurring && (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="recurring-weeks">
              Additional weeks
            </label>
            <input
              id="recurring-weeks"
              className={styles.input}
              type="number"
              min={1}
              max={3}
              value={recurringWeeks}
              onChange={(e) => setRecurringWeeks(Number(e.target.value))}
            />
          </div>
        )}

        <fieldset className={styles.fieldGroup}>
          <legend className={styles.label}>Payment</legend>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input type="radio" name="payment" checked={!isPrepaid} onChange={() => setIsPrepaid(false)} />
              Payment pending
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="payment" checked={isPrepaid} onChange={() => setIsPrepaid(true)} />
              Prepaid
            </label>
          </div>
        </fieldset>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="session-notes">
            Notes <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            id="session-notes"
            className={styles.textarea}
            placeholder="Any prep notes or context for this session…"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </Modal>
  );
};

export default CreateSessionModal;
