import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllUsers, fetchAllUsers } from '../../../store/slices/userDirectorySlice';
import { selectAllQuestionnaires } from '../../../store/slices/questionnairesSlice';
import { selectAllResources } from '../../../store/slices/resourcesSlice';
import Card from '../../../components/shared/Card/Card';
import Avatar from '../../../components/shared/Avatar/Avatar';
import Button from '../../../components/shared/Button/Button';
import { useAuth } from '../../../context/AuthContext';
import type { AppDispatch } from '../../../store/index';
import styles from './AdminDashboard.module.scss';

// ── SVG Icons ──────────────────────────────────────────────
const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="4" rx="1"/>
    <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/>
    <line x1="12" y1="11" x2="12" y2="17"/>
    <line x1="9" y1="14" x2="15" y2="14"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const COLORS = ['teal', 'sky', 'teal', 'peach'] as const;

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const allClients     = useSelector(selectAllUsers);
  const questionnaires = useSelector(selectAllQuestionnaires);
  const resources      = useSelector(selectAllResources);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const publishedResources = resources.filter(r => r.isPublished).length;
  const activeQs           = questionnaires.filter(q => q.isActive).length;

  const metrics = [
    { label: 'Active clients',      value: allClients.length,     icon: <UsersIcon />,     color: 'teal',  to: '/admin/clients' },
    { label: 'Questionnaires',      value: questionnaires.length, icon: <ClipboardIcon />, color: 'stone', to: '/admin/questionnaires' },
    { label: 'Active check-ins',    value: activeQs,              icon: <CheckIcon />,     color: 'sky',   to: '/admin/questionnaires' },
    { label: 'Published resources', value: publishedResources,    icon: <BookIcon />,      color: 'peach', to: '/admin/resources' },
  ];

  const quickActions = [
    { to: '/admin/questionnaires', label: 'New questionnaire', color: 'teal' },
    { to: '/admin/resources',      label: 'Write an article',  color: 'stone' },
    { to: '/admin/clients',        label: 'Add a client',      color: 'warm' },
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
          {metrics.map(m => (
            <Link key={m.label} to={m.to} style={{ textDecoration: 'none' }}>
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
                <Link to="/admin/clients" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="sm">Manage</Button>
                </Link>
              </div>
              <div className={styles.clientList}>
                {allClients.slice(0, 4).map(u => (
                  <div key={u.id} className={styles.clientRow}>
                    <Avatar
                      initials={`${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`}
                      color="teal"
                      size={36}
                    />
                    <div className={styles.clientInfo}>
                      <p className={styles.clientName}>{u.first_name} {u.last_name}</p>
                      <p className={styles.clientMeta}>Joined {u.created_at?.split('T')[0]}</p>
                    </div>
                  </div>
                ))}
                {allClients.length === 0 && (
                  <p className={styles.empty}>No clients yet. Add one to get started.</p>
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
                {quickActions.map(a => (
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
