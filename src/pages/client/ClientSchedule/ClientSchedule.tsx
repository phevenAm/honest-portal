// client should be able to see future sessions, which the admin believes they have paid for. they can cancel any future days and move any dates. the days change sends and email to admin who can confirm that thats fine with them. it should really prompt a converation

import { useMemo, useState } from "react";

import { useAuth } from "@context/AuthContext";
import { RootState } from "@/store";

import { Card, SessionCard, ToggleButtonTabs } from "@/components/shared";
import { ToggleButtonTabsTypes } from "@/components/shared/ToggleButtonTabs/ToggleButtonTabs";
import { Session } from "@/models/globalTypes";
import { useAppDispatch, useAppSelector, useFetchOnIdle } from "@/store/hooks";
import { fetchSessionsByClientId } from "@/store/slices/sessionsSlice";

import styles from "./ClientSchedule.module.scss";

const ClientSchedule = () => {
  const { userProfile, isDemo, isAdmin } = useAuth();
  //   console.log(userProfile);
  // const [userSessions, setUserSessions] = useState<Session[]>([]);
  const [activeTabs, setActiveTabs] = useState<"past" | "upcoming">("upcoming");

  userProfile &&
    useFetchOnIdle(
      (state: RootState) => state.sessions.status,
      () => fetchSessionsByClientId(userProfile?.id),
      "Failed to fetch client's sessions",
    );

  const mySessions = (useAppSelector((state) => state.sessions.sessions) ?? [])
    .slice()
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const upcomingSessions = useMemo(
    () => mySessions.filter((s) => new Date(s.scheduled_at) >= new Date()),
    [mySessions],
  );
  const pastSessions = useMemo(() => mySessions.filter((s) => new Date(s.scheduled_at) < new Date()), [mySessions]);

  const tabsObj: ToggleButtonTabsTypes = {
    leftButtonAction: () => setActiveTabs("past"),
    leftButtonTitle: "Past sessions",
    rightButtonTitle: "Upcoming Sessions",
    rightButtonAction: () => setActiveTabs("upcoming"),
  };

  const sessionsToRender = () => {
    return activeTabs === "past" ? pastSessions : upcomingSessions;
  };

  return (
    <div className="page">
      <div className="inner">
        <h1 className={styles.heading}>My Sessions</h1>
        <div className={styles.flexWrapper}>
          <Card className={styles.sessions}>
            {/* TODO: replace with <NextSessionCard session={upcomingSessions[0]} /> — bespoke component
                showing date/time prominently, duration, paid status, and a cancel button */}
            {upcomingSessions[0] && <SessionCard session={upcomingSessions[0]} />}

            {/* TODO: empty state when upcomingSessions.length === 0 — "No upcoming sessions booked" */}

            {/* TODO: SessionStatsStrip — X upcoming, X attended, X this month
                computed from upcomingSessions and pastSessions, no extra fetch needed */}
          </Card>

          <Card className={styles.sessionsList}>
            {/* TODO: show past sessions count and upcoming count as small labels above tabs */}
            <div className={styles.tabContainer}>
              <ToggleButtonTabs {...tabsObj} />
            </div>
            <div className={styles.scrollable}>
              {sessionsToRender().length === 0 ? (
                <div className={styles.scrollablenoSessions}>
                  <p>No sessions</p>
                </div>
              ) : (
                sessionsToRender()
                  .slice(1)
                  .map((session) => (
                    <SessionCard key={session.id} session={session} isAdmin={isAdmin} isDemo={isDemo} />
                  ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientSchedule;
