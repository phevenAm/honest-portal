import { useState } from "react";

import { DateTimePicker } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import Button from "@components/shared/Button/Button";
import Modal from "@components/shared/Modal/Modal";

import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase.js";
import { Session } from "@/models/globalTypes";

type ClientRescheduleModalProps = {
  session: Session;
  onClose: () => void;
};

const ClientRescheduleModal = ({ session, onClose }: ClientRescheduleModalProps) => {
  const { showToast } = useToast();
  const [requestedAt, setRequestedAt] = useState<Dayjs | null>(dayjs(session.scheduled_at));
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!requestedAt) return;
    setIsSending(true);

    const { error } = await supabase.functions.invoke("request-reschedule", {
      body: {
        session_id: session.id,
        requested_at: requestedAt.toISOString(),
        message: message.trim() || undefined,
      },
    });

    if (error) {
      showToast("Failed to send request. Please try again.", "danger");
    } else {
      showToast("Reschedule request sent to your therapist.");
      onClose();
    }
    setIsSending(false);
  };

  return (
    <Modal
      title="Request a reschedule"
      onClose={onClose}
      size="sm"
      actions={
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button onClick={handleSubmit} disabled={!requestedAt || isSending}>
            {isSending ? "Sending…" : "Send request"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      <p style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
        Your current session is on <strong>{dayjs(session.scheduled_at).format("dddd D MMM [at] h:mma")}</strong>. Pick
        a date you'd like to move it to — your therapist will confirm.
      </p>
      <DateTimePicker
        value={requestedAt}
        onChange={(val) => setRequestedAt(val)}
        slotProps={{ textField: { fullWidth: true } }}
      />
      <textarea
        placeholder="Any context for the change? (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        style={{ width: "100%", marginTop: "0.75rem", resize: "vertical", fontFamily: "inherit", fontSize: "0.9rem" }}
      />
    </Modal>
  );
};

export default ClientRescheduleModal;
