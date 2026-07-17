import { useEffect, useState } from "react";

import dayjs from "dayjs";

import { useToast } from "@context/ToastContext";

import { supabase } from "@/lib/supabase.js";
import { Session, SessionBlockMeta, SessionEvent } from "@/models/globalTypes";
import IconButton from "../IconButton/IconButton";
import { BinIcon, CancelIcon, PaidIcon, RescheduleIcon, UnpaidIcon } from "../Icons/Icons";
import CancelSessionModal from "./CancelSessionModal/CancelSessionModal";
import ClientRescheduleModal from "./ClientRescheduleModal/ClientRescheduleModal";
import CreateSessionModal from "./CreateSessionModal/CreateSessionModal";
import DeleteSessionModal from "./DeleteSessionModal/DeleteSessionModal";
import PaySessionModal from "./PaySessionModal/PaySessionModal";
import useSessionCard from "./useSessionCard";

import styles from "./SessionCard.module.scss";

interface SessionCardProps {
  session: Session;
  isDemo?: boolean;
  isAdmin?: boolean;
}

export function SessionCard({ session, isDemo, isAdmin }: SessionCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [openEditSession, setOpenEditSession] = useState(false);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const { showToast } = useToast();

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

  const {
    toggleNoShowOrPayment,
    markAttended,
    markNoShow,
    getCardClass,
    getStatusClass,
    formatEventLabel,
    isWithin48Hours,
  } = useSessionCard(session);

  const isPast = dayjs(session.scheduled_at).isBefore(dayjs());

  return (
    <div className={[styles.sessionItem, getCardClass(session.status, session.attended)].filter(Boolean).join(" ")}>
      <p className={styles.date}>{dayjs(session.scheduled_at).format("dddd D MMM YYYY · h:mma")}</p>

      <div className={styles.meta}>
        <span className={styles.duration}>{session.duration_minutes} min</span>
        <span
          className={`${styles.badge} ${getStatusClass(session.status, session.attended, session.paid, session.scheduled_at)}`}
        >
          {session.attended === false
            ? "No Show"
            : session.attended === true && session.paid && isPast
              ? "Completed"
              : session.status.replace("_", " ")}
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
            {isPast ? (
              <>
                <div className={styles.attendanceGroup}>
                  <button
                    type="button"
                    className={[styles.attendanceBtn, session.attended === true ? styles.attendanceBtnAttended : ""]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={markAttended}
                  >
                    Attended
                  </button>
                  <button
                    type="button"
                    className={[styles.attendanceBtn, session.attended === false ? styles.attendanceBtnNoShow : ""]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={markNoShow}
                  >
                    No Show
                  </button>
                </div>
                <div className={styles.actions_Icons}>
                  <IconButton
                    icon={session.paid ? <UnpaidIcon /> : <PaidIcon />}
                    label={session.paid ? "Mark as unpaid" : "Mark as paid"}
                    variant="success"
                    data-action-type="payment"
                    onClick={toggleNoShowOrPayment}
                  />
                  <IconButton
                    icon={<BinIcon />}
                    label="Delete session"
                    variant="danger"
                    disabled={isDemo}
                    onClick={() => setIsDeleteModalOpen(true)}
                  />
                </div>
              </>
            ) : (
              <div className={styles.actions_Icons}>
                <IconButton
                  icon={<RescheduleIcon />}
                  label="Reschedule session"
                  variant="info"
                  onClick={() => setOpenEditSession(true)}
                />
                <IconButton
                  icon={<BinIcon />}
                  label="Delete session"
                  variant="danger"
                  disabled={isDemo}
                  onClick={() => setIsDeleteModalOpen(true)}
                />
              </div>
            )}
          </>
        ) : (
          dayjs(session.scheduled_at).isAfter(dayjs()) &&
          !isWithin48Hours && (
            <div className={styles.actions_Icons}>
              <IconButton
                icon={<PaidIcon />}
                label="Pay"
                variant="success"
                disabled={isDemo || session.paid}
                onClick={() => {
                  if (isWithin48Hours) {
                    showToast(
                      "Sessions cannot be cancelled or rescheduled within 48 hours of the appointment",
                      "warning",
                    );
                    return;
                  } else {
                    setIsPayModalOpen(true);
                  }
                }}
              />
              <IconButton
                icon={<RescheduleIcon />}
                label="Reschedule"
                variant="info"
                disabled={isDemo}
                onClick={() => {
                  if (isWithin48Hours) {
                    showToast(
                      "Sessions cannot be cancelled or rescheduled within 48 hours of the appointment",
                      "warning",
                    );
                    return;
                  } else {
                    setIsRescheduleModalOpen(true);
                  }
                }}
              />
              <IconButton
                icon={<CancelIcon />}
                label="Cancel session"
                variant="danger"
                disabled={isDemo}
                onClick={() => {
                  if (isWithin48Hours) {
                    showToast(
                      "Sessions cannot be cancelled or rescheduled within 48 hours of the appointment",
                      "warning",
                    );
                    return;
                  } else {
                    setIsCancelModalOpen(true);
                  }
                }}
              />
            </div>
          )
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
