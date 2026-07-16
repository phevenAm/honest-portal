import { type MouseEvent } from "react";

import dayjs from "dayjs";

import { useToast } from "@/context/ToastContext";
import { Session, SessionEvent } from "@/models/globalTypes";
import { useAppDispatch } from "@/store/hooks";
import { updateSession } from "@/store/slices/sessionsSlice";

import styles from "./SessionCard.module.scss";

const useSessionCard = (session: Session) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

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

  return {
    toggleNoShowOrPayment,
    getStatusClass,
    getCardClass,
    formatEventLabel,
  };
};

export default useSessionCard;
