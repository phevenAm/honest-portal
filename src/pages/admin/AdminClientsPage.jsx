// ============================================================
// ADMIN CLIENTS PAGE — add/remove clients, view their data
// PDF export wired up per client
// ============================================================

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addUser, removeUser, selectAllUsers } from '../../store/slices/usersSlice';
import { selectUserQuestionnaireResponses } from '../../store/slices/responsesSlice';
import Card from '../../components/shared/Card';
import Avatar from '../../components/shared/Avatar';
import Button from '../../components/shared/Button';
import ProgressChart from '../../components/shared/ProgressChart';

// ── PDF Export helper ──────────────────────────────────────
// Uses jsPDF to generate a nicely-formatted client report.
// In a real app you'd call your backend to generate the PDF there.
const exportClientPDF = async (user, responses) => {
  // Dynamically import so it doesn't bloat the initial bundle
  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const margin = 20;

  // Header band
  doc.setFillColor(168, 197, 176); // sage
  doc.rect(0, 0, pageW, 40, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('MindfulSpace', margin, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Client Progress Report', margin, 28);

  // Client info
  doc.setTextColor(45, 41, 38);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(user.name, margin, 56);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`${user.email}  •  Joined ${user.joinedAt}  •  Generated ${new Date().toLocaleDateString()}`, margin, 64);

  // Summary stats
  if (responses.length > 0) {
    const avgScores = responses.map(r =>
      parseFloat((Object.values(r.scores).reduce((a, b) => a + b, 0) / 4).toFixed(1))
    );
    const overall = (avgScores.reduce((a, b) => a + b, 0) / avgScores.length).toFixed(1);
    const latest  = avgScores[avgScores.length - 1];
    const first   = avgScores[0];
    const change  = (latest - first).toFixed(1);

    doc.setFillColor(243, 241, 238);
    doc.roundedRect(margin, 74, (pageW - margin * 2 - 8) / 3, 22, 4, 4, 'F');
    doc.roundedRect(margin + (pageW - margin * 2 - 8) / 3 + 4, 74, (pageW - margin * 2 - 8) / 3, 22, 4, 4, 'F');
    doc.roundedRect(margin + ((pageW - margin * 2 - 8) / 3 + 4) * 2, 74, (pageW - margin * 2 - 8) / 3, 22, 4, 4, 'F');

    [[`${overall}/10`, 'Overall avg'], [`${latest}/10`, 'Latest score'], [`${change >= 0 ? '+' : ''}${change}`, 'Change']].forEach(([val, label], i) => {
      const x = margin + i * ((pageW - margin * 2 - 8) / 3 + 4) + 8;
      doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(45, 41, 38);
      doc.text(val, x, 83);
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(130, 130, 130);
      doc.text(label, x, 90);
    });
  }

  // Weekly log table
  doc.setTextColor(45, 41, 38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Weekly Scores', margin, 110);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const cols = ['Week', 'Mood', 'Sleep', 'Connection', 'Coping', 'Avg'];
  const colW = (pageW - margin * 2) / cols.length;

  // Table header
  doc.setFillColor(168, 197, 176);
  doc.rect(margin, 114, pageW - margin * 2, 7, 'F');
  doc.setTextColor(255,255,255);
  cols.forEach((c, i) => doc.text(c, margin + i * colW + 2, 119));

  // Table rows
  const displayResponses = responses.slice(-12); // last 12
  displayResponses.forEach((r, idx) => {
    const y = 121 + idx * 7;
    if (idx % 2 === 0) { doc.setFillColor(248, 246, 244); doc.rect(margin, y, pageW - margin * 2, 7, 'F'); }
    doc.setTextColor(45, 41, 38);
    const avg = (Object.values(r.scores).reduce((a, b) => a + b, 0) / 4).toFixed(1);
    [r.week, r.scores['q1-1'], r.scores['q1-2'], r.scores['q1-3'], r.scores['q1-4'], avg]
      .forEach((v, i) => doc.text(String(v), margin + i * colW + 2, y + 5));
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(170, 170, 170);
  doc.text('Confidential — MindfulSpace Client Report', margin, 285);

  doc.save(`${user.name.replace(' ', '_')}_progress_report.pdf`);
};

// ── Add Client form ────────────────────────────────────────
function AddClientForm({ onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Both name and email are required');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    dispatch(addUser(form));
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <Card style={{ width: '100%', maxWidth: 420, padding: 32 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: 24 }}>Add new client</h3>
        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 16 }}>{error}</p>
        )}
        {['name', 'email'].map(field => (
          <div key={field} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {field}
            </label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              value={form[field]}
              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              placeholder={field === 'email' ? 'client@email.com' : 'Full name'}
              style={{
                width: '100%', padding: '10px 13px',
                border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
                background: 'var(--bg-base)', color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)', fontSize: '0.95rem',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add client</Button>
        </div>
      </Card>
    </div>
  );
}

// ── Client row ─────────────────────────────────────────────
function ClientRow({ user }) {
  const dispatch  = useDispatch();
  const responses = useSelector(selectUserQuestionnaireResponses(user.id, 'q-1'));
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await exportClientPDF(user, responses);
    setExporting(false);
  };

  const latest = responses[responses.length - 1];
  const avgScore = latest
    ? (Object.values(latest.scores).reduce((a, b) => a + b, 0) / 4).toFixed(1)
    : null;

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        <Avatar initials={user.avatar} color={user.color} size={40} />
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ fontWeight: 500, marginBottom: 2 }}>{user.name}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
        </div>
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{avgScore || '–'}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/10</span></p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Latest</p>
        </div>
        <div style={{ textAlign: 'center', minWidth: 60 }}>
          <p style={{ fontWeight: 600 }}>{responses.length}</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Check-ins</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Hide' : 'View'} data
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? '…' : '⬇ PDF'}
          </Button>
          <Button
            variant="danger" size="sm"
            onClick={() => {
              if (window.confirm(`Remove ${user.name} from the portal?`)) {
                dispatch(removeUser(user.id));
              }
            }}
            aria-label={`Remove ${user.name}`}
          >
            Remove
          </Button>
        </div>
      </div>

      {/* Expanded chart */}
      {expanded && (
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
          <ProgressChart responses={responses} title={`${user.name}'s Progress`} />
        </div>
      )}
    </>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function AdminClientsPage() {
  const users      = useSelector(selectAllUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch]   = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 500, marginBottom: 6 }}>Clients</h1>
            <p style={{ color: 'var(--text-muted)' }}>{users.length} active {users.length === 1 ? 'client' : 'clients'}</p>
          </div>
          <Button onClick={() => setShowAdd(true)}>＋ Add client</Button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search clients"
            style={{
              width: '100%', maxWidth: 360, padding: '10px 14px',
              border: '1.5px solid var(--border)', borderRadius: 'var(--r-full)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none',
            }}
          />
        </div>

        <Card>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              {users.length === 0 ? 'No clients yet. Add your first client above.' : 'No clients match your search.'}
            </div>
          ) : (
            filtered.map(u => <ClientRow key={u.id} user={u} />)
          )}
        </Card>

      </div>

      {showAdd && <AddClientForm onClose={() => setShowAdd(false)} />}
    </div>
  );
}
