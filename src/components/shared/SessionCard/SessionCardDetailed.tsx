import { useEffect, useState } from "react";

import dayjs from "dayjs";

import Button from "@components/shared/Button";

import { supabase } from "@/lib/supabase.js";
import { Session, SessionBlockMeta, SessionEvent } from "@/models/globalTypes";

import CancelSessionModal from "./CancelSessionModal/CancelSessionModal";
import ClientRescheduleModal from "./ClientRescheduleModal/ClientRescheduleModal";
import CreateSessionModal from "./CreateSessionModal/CreateSessionModal";
import DeleteSessionModal from "./DeleteSessionModal/DeleteSessionModal";
import PaySessionModal from "./PaySessionModal/PaySessionModal";

import styles from "./SessionCardDetailed.module.scss";
import useSessionCard from "./useSessionCard";

interface SessionCardProps {
  session: Session;
  isDemo?: boolean;
  isAdmin?: boolean;
}

export function SessionCardDetailed({ session, isDemo, isAdmin }: SessionCardProps) {
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

  const { toggleNoShowOrPayment, getCardClass, getStatusClass, formatEventLabel } = useSessionCard(session);

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
        {session.metadata && (session.metadata as SessionBlockMeta).block_id && (
          <span className={styles.blockBadge} title={`Block ID: ${(session.metadata as SessionBlockMeta).block_id}`}>
            Block {dayjs((session.metadata as SessionBlockMeta).block_start).format("D MMM")} ·{" "}
            {(session.metadata as SessionBlockMeta).block_pos}/{(session.metadata as SessionBlockMeta).block_total}
          </span>
        )}
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
