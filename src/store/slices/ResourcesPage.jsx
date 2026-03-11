// ============================================================
// RESOURCES PAGE (client view) — articles and videos
// ============================================================

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectPublishedResources } from '../../store/slices/resourcesSlice';
import Card from '../../components/shared/Card';

const TYPE_ICONS = { article: '📖', video: '🎬', worksheet: '📋' };
const CATEGORY_COLORS = {
  'Psychoeducation': 'sage',
  'Coping Skills':   'lavender',
  'Breathwork':      'blush',
  'Self-Compassion': 'peach',
};

function ResourceCard({ resource }) {
  const [expanded, setExpanded] = useState(false);
  const color = CATEGORY_COLORS[resource.category] || 'sage';

  return (
    <Card style={{ overflow: 'hidden' }}>
      {/* Colour band */}
      <div style={{ height: 4, background: `var(--${color})` }} />
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
          <div>
            <span style={{
              display: 'inline-block', fontSize: '0.7rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              color: `var(--${color}-dark, var(--${color}))`,
              background: `var(--${color}-light)`,
              padding: '3px 8px', borderRadius: 'var(--r-full)', marginBottom: 8,
            }}>
              {TYPE_ICONS[resource.type]} {resource.category}
            </span>
            <h3 style={{ fontSize: '1rem', lineHeight: 1.4 }}>{resource.title}</h3>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
          {resource.excerpt}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {resource.readTime || resource.duration}
          </span>
          {resource.type !== 'video' && (
            <button
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                padding: 0,
              }}
            >
              {expanded ? 'Read less ↑' : 'Read more →'}
            </button>
          )}
        </div>

        {/* Expanded content */}
        {expanded && resource.content && (
          <div style={{
            marginTop: 16, paddingTop: 16,
            borderTop: '1px solid var(--border)',
            fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8,
          }}>
            {resource.content}
          </div>
        )}

        {/* Video embed */}
        {resource.type === 'video' && (
          <div style={{ marginTop: 16, borderRadius: 'var(--r-md)', overflow: 'hidden', aspectRatio: '16/9' }}>
            <iframe
              src={resource.videoUrl}
              title={resource.title}
              width="100%" height="100%"
              style={{ border: 'none', display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export default function ResourcesPage() {
  const resources = useSelector(selectPublishedResources);
  const [filter, setFilter]   = useState('all');

  const types = ['all', ...new Set(resources.map(r => r.type))];
  const filtered = filter === 'all' ? resources : resources.filter(r => r.type === filter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 500, marginBottom: 8 }}>
            Resources
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Curated by your practitioner — take your time with these.
          </p>
        </div>

        {/* Filter tabs */}
        <div role="tablist" aria-label="Filter resources by type" style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {types.map(type => (
            <button
              key={type}
              role="tab"
              aria-selected={filter === type}
              onClick={() => setFilter(type)}
              style={{
                padding: '7px 18px',
                borderRadius: 'var(--r-full)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 500,
                background: filter === type ? 'var(--accent)' : 'var(--bg-card)',
                color: filter === type ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: filter === type ? 'none' : '1px solid var(--border)',
                transition: 'all var(--transition)',
                textTransform: 'capitalize',
              }}
            >
              {type === 'all' ? 'All resources' : type + 's'}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {filtered.map(r => <ResourceCard key={r.id} resource={r} />)}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p>No {filter} resources yet.</p>
          </div>
        )}

      </div>
    </div>
  );
}
