// client should be able to see future sessions, which the admin believes they have paid for. they can cancel any future days and move any dates. the days change sends and email to admin who can confirm that thats fine with them. it should really prompt a converation
import { useAuth } from "@context/AuthContext";
import { fetchSessionsByClientId } from "@/store/slices/sessionsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./ClientSchedule.module.scss";
import { SessionCard } from "@/pages/admin/AdminClientsPageDetailed/SessionCard/SessionCard";
import { useFetchOnIdle } from "@/store/hooks";
import { RootState } from "@/store";
import { Session } from "@/models/globalTypes";
import { useMemo, useState } from "react";

const ClientSchedule = () => {
  const { userProfile } = useAuth();
  //   console.log(userProfile);
  const [userSessions, setUserSessions] = useState<Session[]>([]);

  userProfile &&
    useFetchOnIdle(
      (state: RootState) => state.sessions.status,
      () => fetchSessionsByClientId(userProfile?.id),
      "Failed to fetch client's sessions",
    );

  const mySessions = useAppSelector((state) => state.sessions.sessions);

  const upcomingSessions = useMemo(() => mySessions.filter((s) => new Date(s.scheduled_at) > new Date()), [mySessions]);
  const pastSessions = useMemo(() => mySessions.filter((s) => new Date(s.scheduled_at) > new Date()), [mySessions]);

  return (
    <div className="page">
      <div className="inner">
        <h1>My Sessions</h1>
        <section className={styles.sessions}>
          <div className={styles.sessions_Dashboard}>
            {/* //!summary of sessions. inforapgics of sessions, completed, missed, reschedled? maybe not the last two. show */}
            {/* some random notes from checkins */}
          </div>
          <div className={styles.session_current}>
            {/* //! details fo the current / next session - if paid, option to cancel etc. - if remote or in person (this remote/imperson needs to be added to admin + DB).*/}
          </div>
        </section>
        <aside className={styles.sessionsList}>
          <ul>
            {/* list of past and future sessions, excyding the latest. */}
            {mySessions && <SessionCard />}
            {/* sesion card takes demo, admin and session */}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default ClientSchedule;
