import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../Card/Card';
import styles from './ProgressChart.module.scss';

const WEEKS = 12;

const scoreToHeatColor = (s: number) => {
  if (!s) return 'var(--bg-muted)';
  const stops = [[220,240,235],[180,220,210],[90,170,150],[31,73,64]] as const;
  const t = ((s - 1) / 9) * (stops.length - 1);
  const i = Math.floor(t), f = t - i;
  const a = stops[Math.min(i, stops.length - 1)];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  return `rgb(${Math.round(a[0]+(b[0]-a[0])*f)},${Math.round(a[1]+(b[1]-a[1])*f)},${Math.round(a[2]+(b[2]-a[2])*f)})`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)', fontSize: 13 }}>Week {label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color, fontSize: 12, marginBottom: 2 }}>
          {entry.name}: <strong>{entry.value}/10</strong>
        </p>
      ))}
    </div>
  );
};

const LINE_CONFIG = [
  { key: 'Mood',       color: '#2d7264' },
  { key: 'Sleep',      color: '#5a8a6a' },
  { key: 'Connection', color: '#3a7fa8' },
  { key: 'Coping',     color: '#8a6a2d' },
];

const DIMS = ['Mood', 'Sleep', 'Connection', 'Coping'];
const SCORE_KEYS = ['q1-1', 'q1-2', 'q1-3', 'q1-4'];

function LineView({ data }: { data: any[] }) {
  const chartData = data.map(r => ({
    week: r.week,
    Mood:       r.scores['q1-1'],
    Sleep:      r.scores['q1-2'],
    Connection: r.scores['q1-3'],
    Coping:     r.scores['q1-4'],
  }));

  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="week" tickFormatter={v => `W${v}`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} ticks={[0,2,4,6,8,10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 14, color: 'var(--text-secondary)' }} />
          {LINE_CONFIG.map(l => (
            <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5}
              dot={{ r: 3, fill: l.color, strokeWidth: 0 }} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

function HeatView({ data }: { data: any[] }) {
  const cols = data.length;
  return (
    <div className={styles.heatmapWrap}>
      <div className={styles.heatmapGrid} style={{ gridTemplateColumns: `72px repeat(${cols}, 1fr)` }}>
        <div />
        {data.map(r => (
          <div key={r.week} className={styles.heatmapWeekLabel}>W{r.week}</div>
        ))}
        {DIMS.map((dim, di) => (
          <React.Fragment key={dim}>
            <div className={styles.heatmapRowLabel}>{dim}</div>
            {data.map(r => (
              <div
                key={r.week}
                role="img"
                aria-label={`${dim} week ${r.week}: ${r.scores[SCORE_KEYS[di]]}/10`}
                title={`${dim} — Week ${r.week}: ${r.scores[SCORE_KEYS[di]]}/10`}
                className={styles.heatCell}
                style={{ background: scoreToHeatColor(r.scores[SCORE_KEYS[di]]) }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className={styles.heatLegend}>
        <span>Low</span>
        {[1,3,5,7,9].map(s => (
          <div key={s} className={styles.heatLegendSwatch} style={{ background: scoreToHeatColor(s) }} />
        ))}
        <span>High</span>
      </div>
    </div>
  );
}

interface ProgressChartProps {
  responses: any[];
  title?:    string;
}

export default function ProgressChart({ responses, title = 'Your Progress' }: ProgressChartProps) {
  const [view, setView] = useState<'line' | 'heat'>('line');

  if (!responses || responses.length === 0) {
    return (
      <Card>
        <p className={styles.empty}>No responses yet. Complete your first check-in to see your progress.</p>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <div className={styles.chartHeader}>
        <div className={styles.chartMeta}>
          <h3>{title}</h3>
          <p>{responses.length} weeks tracked</p>
        </div>
        <div role="group" aria-label="Chart type" className={styles.toggle}>
          {(['line', 'heat'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={view === v ? styles.toggleBtnActive : styles.toggleBtn}
            >
              {v === 'line' ? 'Line graph' : 'Heatmap'}
            </button>
          ))}
        </div>
      </div>

      {view === 'line' ? <LineView data={responses} /> : <HeatView data={responses} />}

      {view === 'line' && (
        <div className={styles.legend}>
          {LINE_CONFIG.map(l => (
            <div key={l.key} className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: l.color }} />
              {l.key}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
