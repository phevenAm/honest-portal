import { type MouseEvent, useState } from "react";

import dayjs from "dayjs";

import Button from "@components/shared/Button";
import { useToast } from "@context/ToastContext";

import { Session } from "@/models/globalTypes";
import { useAppDispatch } from "@/store/hooks";
import { updateSession } from "@/store/slices/sessionsSlice";
import DeleteSessionModal from "../DeleteSessionModal/DeleteSessionModal";

import styles from "./SessionCard.module.scss";

function getStatusClass(status: string, attended: boolean | null): string {
  if (attended === false) return styles.statusNoShow;
  switch (status) {
    case "completed":
      return styles.statusCompleted;
    case "cancelled":
      return styles.statusCancelled;
    case "rescheduled":
      return styles.statusRescheduled;
    default:
      return styles.statusScheduled;
  }
}

function getCardClass(status: string, attended: boolean | null): string {
  if (attended === false) return styles.sessionItemNoShow;
  if (status === "rescheduled") return styles.sessionItemRescheduled;
  return "";
}

interface SessionCardProps {
  session: Session;
  isDemo: boolean;
  isAdmin: boolean;
}

export function SessionCard({ session, isDemo, isAdmin }: SessionCardProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const toggleNoShowOrPayment = (e: MouseEvent<HTMLButtonElement>) => {
    const actionType = e.currentTarget.getAttribute("data-action-type");
    if (actionType === "attendance") {
      dispatch(updateSession({ id: session.id, attended: !session.attended }));
    }

    if (actionType === "payment") {
      dispatch(updateSession({ id: session.id, paid: !session.paid }));
    }
    showToast(`Updated ${actionType} status`);
  };

  return (
    <div className={[styles.sessionItem, getCardClass(session.status, session.attended)].filter(Boolean).join(" ")}>
      <div className={styles.sessionItemHeader}>
        <span className={styles.sessionItemDate}>{dayjs(session.scheduled_at).format("dddd D MMM YYYY · h:mma")}</span>
        <span className={styles.sessionItemMeta}>{session.duration_minutes} min</span>
        <span className={`${styles.sessionStatusBadge} ${getStatusClass(session.status, session.attended)}`}>
          {session.attended === false ? "No Show" : session.status.replace("_", " ")}
        </span>
        <span
          className={session.paid ? styles.paidPill : styles.unpaidPill}
          title={session.paid ? "Paid" : "Payment pending"}
        >
          £
        </span>
      </div>

      {session.notes ? (
        <p className={styles.sessionNotes}>{session.notes}</p>
      ) : (
        <p className={styles.sessionNoNotes}>No notes added.</p>
      )}

      <div className={styles.sessionActions}>
        <Button variant="secondary" size="sm">
          Reschedule
        </Button>
        {/* //!admin can change, client only sends email to admin */}
        {isAdmin && (
          <>
            <Button variant="ghost" size="sm" onClick={toggleNoShowOrPayment} data-action-type="attendance">
              {session.attended ? "Attended" : "No show"}
            </Button>

            <Button data-action-type="payment" onClick={toggleNoShowOrPayment}>
              {session.paid ? "Mark as unpaid" : "Mark as paid"}
            </Button>

            <Button variant="danger" size="sm" disabled={isDemo} onClick={() => setIsDeleteModalOpen(true)}>
              Delete
            </Button>
          </>
        )}
      </div>

      {isDeleteModalOpen && <DeleteSessionModal id={session.id} onClose={setIsDeleteModalOpen} />}
    </div>
  );
}
