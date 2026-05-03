import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectPublishedResources, fetchPublishedResources } from '../../../store/slices/resourcesSlice';
import Card from '../../../components/shared/Card/Card';
import styles from './ResourcesPage.module.scss';
  import type { Resource } from '../../../models/globalTypes';
import { useFetchOnIdle } from "../../../Hooks/Hooks";
import type { AppDispatch, RootState } from "../../../store/index";
import { ArticleIcon, VideoIcon } from "../../../components/shared/Icons/Icons";
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



  useFetchOnIdle(
    (state: RootState) => state.resources.status,
    fetchPublishedResources,
    "Failed to fetch resources:"
  );

  const types = ["all", ...new Set(resources.map((r) => r.type))];
  const filtered =
    filter === "all" ? resources : resources.filter((r) => r.type === filter);


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
