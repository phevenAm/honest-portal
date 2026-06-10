import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useFetchOnIdle } from "../../../store/hooks";
import {
  selectAllUsers,
  fetchAllUsers,
} from "../../../store/slices/userDirectorySlice";
import {
  fetchQuestionnaires,
  selectAllQuestionnaires,
} from "../../../store/slices/questionnairesSlice";
import { fetchResources, selectAllResources } from "../../../store/slices/resourcesSlice";
import Card from "../../../components/shared/Card/Card";
import Avatar from "../../../components/shared/Avatar/Avatar";
import Button from "../../../components/shared/Button/Button";
import { useAuth } from "../../../context/AuthContext";
import type { RootState } from "../../../store/index";

import styles from "./AdminDashboard.module.scss";
import { UsersIcon, ClipboardIcon, CheckIcon, BookIcon, PlusIcon } from '../../../components/shared/Icons/Icons';


export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const allClients = useAppSelector(selectAllUsers);
  const questionnaires = useAppSelector(selectAllQuestionnaires);
  const resources = useAppSelector(selectAllResources);

  useFetchOnIdle(
    (state: RootState) => state.userDirectory.status,
    () => fetchAllUsers(),
    "Failed to fetch users:"
  )

  useFetchOnIdle(
    (state: RootState) => state.questionnaires.status,
    () => fetchQuestionnaires(),
    'Failed to fetch questionnaires'
  )

  useFetchOnIdle(
    (state: RootState) => state.resources.status,
    () => fetchResources(),
    "Failed to fetch resources:"
  );

  const publishedResources = resources.filter((r) => r.is_published).length;
  const activeQs = questionnaires.filter((q) => q.is_active).length;

  const metrics = [
    {
      label: "Active clients",
      value: allClients.length,
      icon: <UsersIcon />,
      color: "teal",
      to: "/admin/clients",
    },
    {
      label: "Questionnaires",
      value: questionnaires.length,
      icon: <ClipboardIcon />,
      color: "stone",
      to: "/admin/questionnaires",
    },
    {
      label: "Active check-ins",
      value: activeQs,
      icon: <CheckIcon />,
      color: "sky",
      to: "/admin/questionnaires",
    },
    {
      label: "Published resources",
      value: publishedResources,
      icon: <BookIcon />,
      color: "peach",
      to: "/admin/resources",
    },
  ];

  const quickActions = [
    { to: "/admin/questionnaires", label: "New questionnaire", color: "teal" },
    { to: "/admin/resources", label: "Create a new resource", color: "stone" },
    { to: "/admin/clients", label: "Add a client", color: "warm" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1>Welcome back, {userProfile?.first_name}</h1>
          <p>Here's a summary of your practice portal</p>
        </div>

        {/* Metrics */}
        <div className={styles.metricsGrid}>
          {metrics.map((m) => (
            <Link key={m.label} to={m.to} style={{ textDecoration: "none" }}>
              <Card className={styles.metricCard}>
                <div className={`${styles.metricIcon} ${styles[m.color]}`}>
                  {m.icon}
                </div>
                <p className={styles.metricValue}>{m.value}</p>
                <p className={styles.metricLabel}>{m.label}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div className={styles.bottomGrid}>
          {/* Clients */}
          <Card>
            <div className={styles.cardPad}>
              <div className={styles.cardHeader}>
                <h3>Your clients</h3>
                <Link to="/admin/clients" style={{ textDecoration: "none" }}>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
              <div className={styles.clientList}>
                {allClients.slice(0, 4).map((u) => (
                  <div key={u.id} className={styles.clientRow}>
                    <Avatar
                      initials={`${u.first_name?.[0] ?? ""}${u.last_name?.[0] ?? ""}`}
                      color="teal"
                      size={36}
                    />
                    <div className={styles.clientInfo}>
                      <p className={styles.clientName}>
                        {u.first_name} {u.last_name}
                      </p>
                      <p className={styles.clientMeta}>
                        Joined {u.created_at?.split("T")[0]}
                      </p>
                    </div>
                  </div>
                ))}
                {allClients.length === 0 && (
                  <p className={styles.empty}>
                    No clients yet. Add one to get started.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <div className={styles.cardPad}>
              <div className={styles.cardHeader}>
                <h3>Quick actions</h3>
              </div>
              <div className={styles.actionList}>
                {quickActions.map((a) => (
                  <Link key={a.to} to={a.to} className={styles.actionLink}>
                    <div className={`${styles.actionItem} ${styles[a.color]}`}>
                      <PlusIcon />
                      {a.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
