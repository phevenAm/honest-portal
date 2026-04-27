import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserQuestionnaireResponses } from '../../../store/slices/responsesSlice';
import { selectActiveQuestionnaires } from '../../../store/slices/questionnairesSlice';
import ProgressChart from '../../../components/shared/ProgressChart/ProgressChart';
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import { useAuth } from '../../../context/AuthContext';
import styles from './ClientDashboard.module.scss';

const STAT_COLORS = ['teal', 'stone', 'teal', 'warm'] as const;

export default function ClientDashboard() {
  const { user } = useAuth();
  const responses      = useSelector(selectUserQuestionnaireResponses(user?.id, 'q-1'));
  const questionnaires = useSelector(selectActiveQuestionnaires);
  const assignedQs     = questionnaires.filter(q => q.assignedTo.includes(user?.id));

  const latestResponse = responses[responses.length - 1];
  const avgScore = latestResponse
    ? (Object.values(latestResponse.scores as Record<string, number>).reduce((a, b) => a + b, 0) / 4).toFixed(1)
    : '–';

  const firstAvg = responses[0]
    ? (Object.values(responses[0].scores as Record<string, number>).reduce((a, b) => a + b, 0) / 4).toFixed(1)
    : null;
  const improvement = firstAvg && latestResponse
    ? (parseFloat(avgScore) - parseFloat(firstAvg)).toFixed(1)
    : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Latest score',   value: `${avgScore}/10`, sub: "This week's average",  color: 'teal' },
    { label: 'Weeks tracked',  value: responses.length, sub: 'Total check-ins',       color: 'stone' },
    ...(improvement !== null ? [{
      label: 'Overall change',
      value: `${parseFloat(improvement) >= 0 ? '+' : ''}${improvement}`,
      sub: 'Since you started',
      color: parseFloat(improvement) >= 0 ? 'teal' : 'danger',
    }] : []),
    { label: 'Active plans', value: assignedQs.length, sub: 'Check-ins assigned', color: 'warm' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1>{greeting}, {user?.first_name}</h1>
          <p>Here's a look at how you've been doing</p>
        </div>

        <div className={styles.statsRow}>
          {stats.map(s => (
            <div key={s.label} className={`${styles.statCard} ${styles[s.color as keyof typeof styles]}`}>
              <p className={styles.statLabel}>{s.label}</p>
              <p className={styles.statValue}>{s.value}</p>
              <p className={styles.statSub}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className={styles.chartWrap}>
          <ProgressChart responses={responses} title="Your Wellbeing Over Time" />
        </div>

        <div className={styles.bottomGrid}>
          <Card>
            <div className={styles.cardPad}>
              <h3 className={styles.cardTitle}>Your Check-ins</h3>
              {assignedQs.length === 0 ? (
                <p className={styles.emptyText}>No check-ins assigned yet.</p>
              ) : (
                <div className={styles.checkInList}>
                  {assignedQs.map(q => (
                    <div key={q.id} className={styles.checkInRow}>
                      <div>
                        <p className={styles.checkInTitle}>{q.title}</p>
                        <p className={styles.checkInFreq}>{q.frequency}</p>
                      </div>
                      <Link to="/check-in" style={{ textDecoration: 'none' }}>
                        <Button size="sm" variant="secondary">Start</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className={styles.resourcesCard}>
              <h3 className={styles.resourcesTitle}>Resources for you</h3>
              <p className={styles.resourcesDesc}>Articles, breathing exercises, and tools curated by your practitioner.</p>
              <Link to="/resources" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm">Browse resources</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
