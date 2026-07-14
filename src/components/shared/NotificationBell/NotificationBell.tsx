import { useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import { BellIcon } from "@components/shared/Icons/Icons";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase.js";

import styles from "./NotificationBell.module.scss";

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!userProfile?.id) return;

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userProfile.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setNotifications(data as Notification[]);
      });

    const channel = supabase
      .channel(`notifications-${userProfile.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile?.id]);

  useEffect(() => {
    const nav = navigator as Navigator & {
      setAppBadge?: (count: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    if (!nav.setAppBadge) return;
    if (unreadCount > 0) {
      nav.setAppBadge(unreadCount);
    } else {
      nav.clearAppBadge?.();
    }
  }, [unreadCount]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    if (!userProfile?.id || unreadCount === 0) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", userProfile.id).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) markAllRead();
  };

  return (
    <div ref={ref} className={styles.wrapper}>
      <button type="button" className={styles.bell} onClick={handleToggle} aria-label="Notifications">
        <BellIcon />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <p className={styles.title}>Notifications</p>
          {notifications.length === 0 ? (
            <p className={styles.empty}>Nothing here yet</p>
          ) : (
            <ul className={styles.list}>
              {notifications.map((n) => (
                <li key={n.id} className={[styles.item, !n.read ? styles.unread : ""].filter(Boolean).join(" ")}>
                  <p className={styles.message}>{n.message}</p>
                  <p className={styles.date}>{dayjs(n.created_at).format("D MMM [at] h:mma")}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
