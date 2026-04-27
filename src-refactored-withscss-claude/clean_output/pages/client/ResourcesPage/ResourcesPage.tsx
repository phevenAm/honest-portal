import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectPublishedResources } from '../../../store/slices/resourcesSlice';
import Card from '../../../components/shared/Card/Card';
import styles from './ResourcesPage.module.scss';

const ArticleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

function ResourceCard({ resource }: { resource: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <div className={styles.accentBar} style={{ background: 'var(--accent)' }} />
      <div className={styles.cardBody}>
        <span className={styles.categoryBadge}>
          {resource.type === 'video' ? <VideoIcon /> : <ArticleIcon />}
          {resource.category}
        </span>
        <h3 className={styles.cardTitle}>{resource.title}</h3>
        <p className={styles.excerpt}>{resource.excerpt}</p>
        <div className={styles.cardFooter}>
          <span className={styles.readTime}>{resource.readTime || resource.duration}</span>
          {resource.type !== 'video' && (
            <button
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className={styles.readMoreBtn}
            >
              {expanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
        {expanded && resource.content && (
          <div className={styles.expandedContent}>{resource.content}</div>
        )}
        {resource.type === 'video' && (
          <div className={styles.videoWrap}>
            <iframe
              src={resource.videoUrl}
              title={resource.title}
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
  const [filter, setFilter] = useState('all');

  const types    = ['all', ...Array.from(new Set(resources.map((r: any) => r.type)))];
  const filtered = filter === 'all' ? resources : resources.filter((r: any) => r.type === filter);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1>Resources</h1>
          <p>Curated by your practitioner — take your time with these.</p>
        </div>

        <div role="tablist" aria-label="Filter resources by type" className={styles.filterRow}>
          {types.map((t: string) => (
            <button
              key={t}
              role="tab"
              aria-selected={filter === t}
              onClick={() => setFilter(t)}
              className={filter === t ? styles.filterBtnActive : styles.filterBtn}
            >
              {t === 'all' ? 'All resources' : t + 's'}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.map((r: any) => <ResourceCard key={r.id} resource={r} />)}
        </div>

        {filtered.length === 0 && (
          <p className={styles.empty}>No resources available yet.</p>
        )}
      </div>
    </div>
  );
}
