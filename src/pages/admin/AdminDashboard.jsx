// ============================================================
// ADMIN DASHBOARD — overview stats and quick links
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAllUsers } from '../../store/slices/usersSlice';
import { selectAllQuestionnaires } from '../../store/slices/questionnairesSlice';
import { selectAllResources } from '../../store/slices/resourcesSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import Card from '../../components/shared/Card';
import Avatar from '../../components/shared/Avatar';
import Button from '../../components/shared/Button';

function MetricCard({ label, value, icon, color, to }) {
  const content = (
    <Card style={{ padding: '22px' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--r-md)',
        background: `var(--${color}-light)`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 22, marginBottom: 14,
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '1.9rem', fontFamily: 'var(--font-serif)', fontWeight: 500, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</p>
    </Card>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none', display: 'block' }}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const admin          = useSelector(selectCurrentUser);
  const users          = useSelector(selectAllUsers);
  const questionnaires = useSelector(selectAllQuestionnaires);
  const resources      = useSelector(selectAllResources);

  const publishedResources = resources.filter(r => r.isPublished).length;
  const activeQs           = questionnaires.filter(q => q.isActive).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 500, marginBottom: 6 }}>
            Welcome back, {admin?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Here's a summary of your practice portal</p>
        </div>

        {/* Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16, marginBottom: 36,
        }}>
          <MetricCard label="Active clients"    value={users.length}          icon="👥" color="sage"     to="/admin/clients" />
          <MetricCard label="Questionnaires"    value={questionnaires.length} icon="📋" color="lavender" to="/admin/questionnaires" />
          <MetricCard label="Active check-ins"  value={activeQs}              icon="✅" color="sky"      to="/admin/questionnaires" />
          <MetricCard label="Published resources" value={publishedResources}  icon="📚" color="peach"    to="/admin/resources" />
        </div>

        {/* Recent clients */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          <Card style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem' }}>Your clients</h3>
              <Link to="/admin/clients" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm">Manage →</Button>
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {users.slice(0, 4).map(u => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 'var(--r-md)',
                  background: 'var(--bg-muted)',
                }}>
                  <Avatar initials={u.avatar} color={u.color} size={36} />
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{u.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Joined {u.joinedAt}</p>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No clients yet. Add one to get started.</p>
              )}
            </div>
          </Card>

          {/* Quick actions */}
          <Card style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 20 }}>Quick actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/admin/questionnaires', label: '＋  New questionnaire', color: 'lavender' },
                { to: '/admin/resources',      label: '＋  Write an article',  color: 'sage' },
                { to: '/admin/clients',        label: '＋  Add a client',      color: 'blush' },
              ].map(action => (
                <Link key={action.to} to={action.to} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '13px 16px',
                    background: `var(--${action.color}-light)`,
                    borderRadius: 'var(--r-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem', fontWeight: 500,
                    transition: 'opacity var(--transition)',
                    cursor: 'pointer',
                  }}>
                    {action.label}
                  </div>
                </Link>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
