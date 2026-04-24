
// ============================================================
// CLIENT DASHBOARD — "My Progress"
// Shows: greeting, progress chart, recent check-ins, quick actions
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserQuestionnaireResponses } from '../../store/slices/responsesSlice';
import { selectActiveQuestionnaires } from '../../store/slices/questionnairesSlice';
import ProgressChart from '../../components/shared/ProgressChart';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { useAuth } from '../../context/AuthContext';

// Stat card sub-component
function StatCard({ label, value, sub, color }) {
  const colorMap = {
    sage:     { bg: 'var(--sage-light)',     text: 'var(--sage-dark)' },
    lavender: { bg: 'var(--lavender-light)', text: 'var(--lavender)' },
    blush:    { bg: 'var(--blush-light)',    text: 'var(--blush)' },
    peach:    { bg: 'var(--peach-light)',    text: 'var(--peach)' },
  };
  const c = colorMap[color] || colorMap.sage;
  return (
    <div style={{
      background: c.bg, borderRadius: 'var(--r-lg)',
      padding: '20px', flex: '1 1 140px',
    }}>
      <p style={{ fontSize: '0.78rem', color: c.text, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 500, marginBottom: 2 }}>
        {value}
      </p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
}

export default function ClientDashboard() {
  const {user} = useAuth();
  // Get this user's responses for the weekly questionnaire (q-1)
  const responses = useSelector(selectUserQuestionnaireResponses(user?.id, 'q-1'));
  const questionnaires = useSelector(selectActiveQuestionnaires);

  const assignedQs = questionnaires.filter(q => q.assignedTo.includes(user?.id));
  const latestResponse = responses[responses.length - 1];
  const avgScore = latestResponse
    ? (Object.values(latestResponse.scores).reduce((a, b) => a + b, 0) / 4).toFixed(1)
    : '–';

  // Calculate improvement from first to last response
  const firstAvg = responses[0]
    ? (Object.values(responses[0].scores).reduce((a, b) => a + b, 0) / 4).toFixed(1)
    : null;
  const improvement = firstAvg && latestResponse
    ? (parseFloat(avgScore) - parseFloat(firstAvg)).toFixed(1)
    : null;

  const timeOfDay = new Date().getHours();
  const greeting  = timeOfDay < 12 ? 'Good morning' : timeOfDay < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.first_name;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 500, marginBottom: 6 }}>
            {greeting}, {firstName} 🌿
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Here's a look at how you've been doing
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
          <StatCard label="Latest score" value={`${avgScore}/10`} sub="This week's average" color="sage" />
          <StatCard label="Weeks tracked" value={responses.length} sub="Total check-ins" color="lavender" />
          {improvement !== null && (
            <StatCard
              label="Overall change"
              value={`${improvement >= 0 ? '+' : ''}${improvement}`}
              sub="Since you started"
              color={parseFloat(improvement) >= 0 ? 'sage' : 'blush'}
            />
          )}
          <StatCard label="Active plans" value={assignedQs.length} sub="Check-ins assigned" color="peach" />
        </div>

        {/* Chart */}
        <div style={{ marginBottom: 28 }}>
          <ProgressChart
            responses={responses}
            title="Your Wellbeing Over Time"
          />
        </div>

        {/* Bottom row: Due check-ins + quick note */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Assigned questionnaires */}
          <Card style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Your Check-ins</h3>
            {assignedQs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No check-ins assigned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {assignedQs.map(q => (
                  <div key={q.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px',
                    background: 'var(--bg-muted)',
                    borderRadius: 'var(--r-md)',
                  }}>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 2 }}>{q.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {q.frequency}
                      </p>
                    </div>
                    <Link to="/check-in" style={{ textDecoration: 'none' }}>
                      <Button size="sm" variant="secondary">Start</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Resources teaser */}
          <Card style={{ padding: '24px', background: 'linear-gradient(135deg, var(--lavender-light), var(--sage-light))' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Resources for you</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              Articles, breathing exercises, and tools curated by your practitioner.
            </p>
            <Link to="/resources" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm">Browse resources</Button>
            </Link>
          </Card>

        </div>
      </div>
    </div>
  );
}
