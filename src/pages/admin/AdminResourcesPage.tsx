// ============================================================
// ADMIN RESOURCES PAGE — create articles, add videos
// ============================================================

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllResources, addResource, deleteResource, togglePublished } from '../../store/slices/resourcesSlice';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';

const CATEGORIES = ['Psychoeducation', 'Coping Skills', 'Breathwork', 'Self-Compassion', 'Relationships', 'General'];
const COLORS = ['sage', 'lavender', 'blush', 'sky', 'peach'];

function ResourceForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    type: 'article', title: '', excerpt: '', content: '',
    videoUrl: '', category: 'General', color: 'sage',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim() || !form.excerpt.trim()) {
      alert('Title and excerpt are required');
      return;
    }
    onSave(form);
    onClose();
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
    background: 'var(--bg-base)', color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 500, marginBottom: 5, color: 'var(--text-secondary)' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.45)',
      overflowY: 'auto',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px',
    }}>
      <Card style={{ width: '100%', maxWidth: 600, padding: 32 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: 24 }}>New resource</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
              <option value="article">Article</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Resource title" style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Excerpt (summary) *</label>
            <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="A 1–2 sentence description" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {form.type === 'article' ? (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Article content</label>
              <textarea value={form.content} onChange={e => set('content', e.target.value)} placeholder="Write the full article here…" rows={8} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          ) : (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>YouTube embed URL</label>
              <input value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/embed/…" style={inputStyle} />
            </div>
          )}

          <div>
            <label style={labelStyle}>Colour</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => set('color', c)}
                  aria-label={c}
                  aria-pressed={form.color === c}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: `var(--${c})`,
                    border: form.color === c ? '2.5px solid var(--text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save resource</Button>
        </div>
      </Card>
    </div>
  );
}

export default function AdminResourcesPage() {
  const dispatch   = useDispatch();
  const resources  = useSelector(selectAllResources);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = typeFilter === 'all' ? resources : resources.filter(r => r.type === typeFilter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 500, marginBottom: 6 }}>Resources</h1>
            <p style={{ color: 'var(--text-muted)' }}>{resources.filter(r => r.isPublished).length} published, {resources.filter(r => !r.isPublished).length} drafts</p>
          </div>
          <Button onClick={() => setShowForm(true)}>＋ Add resource</Button>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['all', 'article', 'video'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '7px 16px', borderRadius: 'var(--r-full)',
                cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 500,
                background: typeFilter === t ? 'var(--accent)' : 'var(--bg-card)',
                color: typeFilter === t ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: typeFilter === t ? 'none' : '1px solid var(--border)',
                transition: 'all var(--transition)', textTransform: 'capitalize',
              }}
            >
              {t === 'all' ? 'All' : t + 's'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(r => (
            <Card key={r.id} style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--r-md)',
                    background: `var(--${r.color}-light)`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>
                    {r.type === 'video' ? '🎬' : '📖'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, marginBottom: 2 }}>{r.title}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {r.category} · {r.publishedAt} · {r.readTime || r.duration || '–'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: '0.7rem', padding: '3px 9px', borderRadius: 'var(--r-full)',
                    background: r.isPublished ? 'var(--sage-light)' : 'var(--bg-muted)',
                    color: r.isPublished ? 'var(--sage-dark)' : 'var(--text-muted)',
                    fontWeight: 600,
                  }}>
                    {r.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => dispatch(togglePublished(r.id))}>
                    {r.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => dispatch(deleteResource(r.id))}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              No resources yet. Add your first one above.
            </div>
          )}
        </div>

      </div>

      {showForm && (
        <ResourceForm
          onSave={(data) => dispatch(addResource(data))}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
