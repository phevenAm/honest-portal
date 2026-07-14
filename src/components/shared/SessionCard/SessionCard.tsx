import { type MouseEvent, useEffect, useState } from "react";

import dayjs from "dayjs";

import Button from "@components/shared/Button";
import { useToast } from "@context/ToastContext";

import { supabase } from "@/lib/supabase.js";
import { Session, SessionEvent } from "@/models/globalTypes";
import { useAppDispatch } from "@/store/hooks";
import { updateSession } from "@/store/slices/sessionsSlice";
import CancelSessionModal from "./CancelSessionModal/CancelSessionModal";
import ClientRescheduleModal from "./ClientRescheduleModal/ClientRescheduleModal";
import CreateSessionModal from "./CreateSessionModal/CreateSessionModal";
import DeleteSessionModal from "./DeleteSessionModal/DeleteSessionModal";
import PaySessionModal from "./PaySessionModal/PaySessionModal";

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

function formatEventLabel(ev: SessionEvent): string {
  switch (ev.event_type) {
    case "scheduled":
      return "Scheduled";
    case "rescheduled": {
      const from = ev.metadata?.from ? dayjs(ev.metadata.from).format("D MMM [at] h:mma") : null;
      const to = ev.metadata?.to ? dayjs(ev.metadata.to).format("D MMM [at] h:mma") : null;
      return from && to ? `Rescheduled from ${from} to ${to}` : "Rescheduled";
    }
    case "cancelled":
      return "Cancelled";
    case "paid":
      return "Marked as paid";
    case "unpaid":
      return "Marked as unpaid";
    case "attended":
      return "Attended";
    case "no_show":
      return "No show";
    default:
      return ev.event_type;
  }
}

interface SessionCardProps {
  session: Session;
  isDemo?: boolean;
  isAdmin?: boolean;
}

export function SessionCard({ session, isDemo, isAdmin }: SessionCardProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [openEditSession, setOpenEditSession] = useState(false);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("session_events")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setEvents(data as SessionEvent[]);
      });
  }, [session.id, isAdmin]);

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
      <p className={styles.date}>{dayjs(session.scheduled_at).format("dddd D MMM YYYY · h:mma")}</p>

      <div className={styles.meta}>
        <span className={styles.duration}>{session.duration_minutes} min</span>
        <span className={`${styles.badge} ${getStatusClass(session.status, session.attended)}`}>
          {session.attended === false ? "No Show" : session.status.replace("_", " ")}
        </span>
        <span
          className={session.paid ? styles.paidPill : styles.unpaidPill}
          title={session.paid ? "Paid" : "Payment pending"}
        >
          £
        </span>
      </div>

      {session.address && dayjs(session.scheduled_at).isAfter(dayjs()) && (
        <a
          href={
            session.location === "in_person"
              ? `https://maps.google.com/?q=${encodeURIComponent(session.address)}`
              : session.address
          }
          target="_blank"
          rel="noreferrer"
          className={styles.locationLink}
        >
          {session.location === "in_person" ? "Open in Maps" : "Join meeting"}
        </a>
      )}

      {isAdmin && <p className={session.notes ? styles.notes : styles.noNotes}>{session.notes ?? "No notes added."}</p>}

      <div className={styles.actions}>
        {isAdmin ? (
          <>
            <Button variant="ghost" size="sm" onClick={toggleNoShowOrPayment} data-action-type="attendance">
              {session.attended ? "Attended" : "No show"}
            </Button>
            <Button
              size="sm"
              data-action-type="payment"
              onClick={toggleNoShowOrPayment}
              variant={session.paid ? "ghost" : "secondary"}
            >
              {session.paid ? "Mark as unpaid" : "Mark as paid"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setOpenEditSession(true)}>
              Reschedule
            </Button>
            <Button variant="danger" size="sm" disabled={isDemo} onClick={() => setIsDeleteModalOpen(true)}>
              Delete
            </Button>
          </>
        ) : (
          <>
            {!session.paid && (
              <Button variant="primary" size="sm" disabled={isDemo} onClick={() => setIsPayModalOpen(true)}>
                Pay
              </Button>
            )}
            {dayjs(session.scheduled_at).isAfter(dayjs()) && (
              <>
                <Button variant="secondary" size="sm" disabled={isDemo} onClick={() => setIsRescheduleModalOpen(true)}>
                  Reschedule
                </Button>
                <Button variant="danger" size="sm" disabled={isDemo} onClick={() => setIsCancelModalOpen(true)}>
                  Cancel
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {isAdmin && events.length > 0 && (
        <div className={styles.history}>
          <button type="button" className={styles.historyToggle} onClick={() => setShowHistory((v) => !v)}>
            {showHistory ? "Hide history" : `History (${events.length})`}
          </button>
          {showHistory && (
            <ul className={styles.historyList}>
              {events.map((ev) => (
                <li key={ev.id} className={styles.historyItem}>
                  <span className={styles.historyLabel}>{formatEventLabel(ev)}</span>
                  <span className={styles.historyDate}>{dayjs(ev.created_at).format("D MMM YYYY, h:mma")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isDeleteModalOpen && <DeleteSessionModal id={session.id} onClose={() => setIsDeleteModalOpen(false)} />}
      {isCancelModalOpen && <CancelSessionModal session={session} onClose={() => setIsCancelModalOpen(false)} />}
      {isPayModalOpen && <PaySessionModal session={session} onClose={() => setIsPayModalOpen(false)} />}
      {isRescheduleModalOpen && (
        <ClientRescheduleModal session={session} onClose={() => setIsRescheduleModalOpen(false)} />
      )}
      {openEditSession && (
        <CreateSessionModal clientId={session.client_id!} session={session} onClose={() => setOpenEditSession(false)} />
      )}
    </div>
  );
}
