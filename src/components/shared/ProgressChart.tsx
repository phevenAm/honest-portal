// ============================================================
// PROGRESS CHART — toggleable Line Graph ↔ Heatmap
//
// Uses Recharts for the line graph (industry standard for React charts).
// The heatmap is built from scratch with CSS grid — great for learning
// how to render data-driven UIs without a library.
// ============================================================

import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Card from './Card';

// ── Custom Tooltip for the line chart ──────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', padding: '12px 16px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
        Week {label}
      </p>
      {payload.map(entry => (
        <p key={entry.name} style={{ color: entry.color, fontSize: '0.8rem', marginBottom: 2 }}>
          {entry.name}: <strong>{entry.value}/10</strong>
        </p>
      ))}
    </div>
  );
};

// ── Heatmap cell color from score (1–10) ───────────────────
// Maps score to a color intensity on the sage-green scale
const scoreToHeatColor = (score) => {
  if (score === null || score === undefined) return 'var(--bg-muted)';
  const ratio = (score - 1) / 9; // normalise 1–10 to 0–1
  // Interpolate from blush (low) → sage (high)
  const stops = [
    { r: 240, g: 196, b: 196 }, // blush (score ~1)
    { r: 245, g: 212, b: 176 }, // peach (score ~3)
    { r: 200, g: 220, b: 200 }, // light sage (score ~6)
    { r: 106, g: 158, b: 122 }, // sage-dark (score ~10)
  ];
  const segment = ratio * (stops.length - 1);
  const i = Math.floor(segment);
  const t = segment - i;
  const a = stops[Math.min(i, stops.length - 1)];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
};

// ── LINE GRAPH VIEW ────────────────────────────────────────
function LineGraphView({ data }) {
  const LINE_CONFIG = [
    { key: 'q1-1', name: 'Mood',       color: 'var(--sage-dark)' },
    { key: 'q1-2', name: 'Sleep',      color: 'var(--lavender)' },
    { key: 'q1-3', name: 'Connection', color: 'var(--sky)' },
    { key: 'q1-4', name: 'Coping',     color: 'var(--peach)' },
  ];

  // Shape data for Recharts: [{ week: 1, Mood: 5, Sleep: 6, ... }, ...]
  const chartData = data.map(r => ({
    week: r.week,
    Mood:       r.scores['q1-1'],
    Sleep:      r.scores['q1-2'],
    Connection: r.scores['q1-3'],
    Coping:     r.scores['q1-4'],
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="week"
          tickFormatter={v => `W${v}`}
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          domain={[0, 10]} ticks={[0,2,4,6,8,10]}
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={false} tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '0.8rem', paddingTop: 16, color: 'var(--text-secondary)' }}
        />
        {LINE_CONFIG.map(line => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.name}
            stroke={line.color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: line.color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── HEATMAP VIEW ───────────────────────────────────────────
function HeatmapView({ data }) {
  const dimensions = [
    { key: 'q1-1', label: 'Mood' },
    { key: 'q1-2', label: 'Sleep' },
    { key: 'q1-3', label: 'Connection' },
    { key: 'q1-4', label: 'Coping' },
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Low</span>
        {[1,3,5,7,9].map(s => (
          <div key={s} style={{
            width: 20, height: 20, borderRadius: 4,
            background: scoreToHeatColor(s),
          }} />
        ))}
        <span>High</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `90px repeat(${data.length}, 1fr)`, gap: 3 }}>
        {/* Header row — week numbers */}
        <div />
        {data.map(r => (
          <div key={r.week} style={{
            textAlign: 'center', fontSize: '0.7rem',
            color: 'var(--text-muted)', paddingBottom: 4,
          }}>
            W{r.week}
          </div>
        ))}

        {/* One row per dimension */}
        {dimensions.map(dim => (
          <React.Fragment key={dim.key}>
            <div style={{
              fontSize: '0.78rem', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', paddingRight: 8,
              fontWeight: 500,
            }}>
              {dim.label}
            </div>
            {data.map(r => {
              const score = r.scores[dim.key];
              return (
                <div
                  key={r.week}
                  role="img"
                  aria-label={`${dim.label} week ${r.week}: ${score}/10`}
                  title={`${dim.label} — Week ${r.week}: ${score}/10`}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 4,
                    background: scoreToHeatColor(score),
                    transition: 'transform var(--transition)',
                    cursor: 'default',
                    minHeight: 28,
                  }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.15)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────
export default function ProgressChart({ responses, title = 'Your Progress' }) {
  const [view, setView] = useState('line'); // 'line' | 'heatmap'

  if (!responses || responses.length === 0) {
    return (
      <Card style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>No responses yet. Complete your first check-in to see your progress!</p>
      </Card>
    );
  }

  return (
    <Card style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>{title}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {responses.length} weeks tracked
          </p>
        </div>
        {/* Toggle control */}
        <div
          role="group"
          aria-label="Chart type"
          style={{
            display: 'flex', background: 'var(--bg-muted)',
            borderRadius: 'var(--r-full)', padding: 3, gap: 2,
          }}
        >
          {[
            { value: 'line', label: 'Line graph' },
            { value: 'heatmap', label: 'Heatmap' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setView(opt.value)}
              aria-pressed={view === opt.value}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--r-full)',
                border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                background: view === opt.value ? 'var(--bg-card)' : 'transparent',
                color: view === opt.value ? 'var(--accent)' : 'var(--text-muted)',
                boxShadow: view === opt.value ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'line' ? (
        <LineGraphView data={responses} />
      ) : (
        <HeatmapView data={responses} />
      )}
    </Card>
  );
}
