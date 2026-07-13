// client should be able to see future sessions, which the admin believes they have paid for. they can cancel any future days and move any dates. the days change sends and email to admin who can confirm that thats fine with them. it should really prompt a converation

import { useMemo, useState } from "react";

import { useAuth } from "@context/AuthContext";
import { RootState } from "@/store";

import { SessionCard, ToggleButtonTabs } from "@/components/shared";
import { Session } from "@/models/globalTypes";
import { useAppDispatch, useAppSelector, useFetchOnIdle } from "@/store/hooks";
import { fetchSessionsByClientId } from "@/store/slices/sessionsSlice";

import styles from "./ClientSchedule.module.scss";
import { ToggleButtonTabsTypes } from "@/components/shared/ToggleButtonTabs/ToggleButtonTabs";

const ClientSchedule = () => {
  const { userProfile, isDemo, isAdmin } = useAuth();
  //   console.log(userProfile);
  // const [userSessions, setUserSessions] = useState<Session[]>([]);
  const [activeTabs, setActiveTabs] = useState<"past" | "upcoming">("upcoming");

  //   const sessionsGroupByType = useMemo((): Session[] => {
  //       const now = new Date();
  //       return clientSessions.filter((session) => {
  //         const scheduledAt = new Date(session.scheduled_at);
  //         return sessionsDateTab === "upcoming" ? scheduledAt >= now : scheduledAt < now;
  //       });
  //     }, [sessionsDateTab, clientSessions]);

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

  return (
    <div className="page">
      <div className="inner">
        <h1>My Sessions</h1>
        <div className={styles.flexWrapper}>
          <section className={styles.sessions}>
            <div className={styles.sessions_Dashboard}>
              {/* //!summary of sessions. inforapgics of sessions, completed, missed, reschedled? maybe not the last two. show */}
              {/* some random notes from checkins */}
            </div>
            <div className={styles.session_current}>
              {/* //! details fo the current / next session - if paid, option to cancel etc. - if remote or in person (this remote/imperson needs to be added to admin + DB).*/}

              {upcomingSessions[0] && <SessionCard key={upcomingSessions[0]?.id || ""} session={upcomingSessions[0]} />}
            </div>
          </section>
          <aside className={styles.sessionsList}>
            <div className={styles.tabContainer}>
              <ToggleButtonTabs {...tabsObj} />
            </div>
            <div className={styles.scrollable}>
              <ul>
                {(activeTabs === "past" ? pastSessions : upcomingSessions).slice(1).map((session) => (
                  <SessionCard key={session.id} session={session} isAdmin={isAdmin} isDemo={isDemo} />
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ClientSchedule;
