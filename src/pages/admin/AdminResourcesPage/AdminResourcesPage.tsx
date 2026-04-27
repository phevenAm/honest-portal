import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllResources, addResource, deleteResource, togglePublished } from '../../../store/slices/resourcesSlice';
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import styles from './AdminResourcesPage.module.scss';

const CATEGORIES = ['Psychoeducation', 'Coping Skills', 'Breathwork', 'Self-Compassion', 'Relationships', 'General'];

const ArticleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

function ResourceForm({ onSave, onClose }: { onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ type: 'article', title: '', excerpt: '', content: '', videoUrl: '', category: 'General' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim() || !form.excerpt.trim()) { alert('Title and excerpt are required'); return; }
    onSave(form);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <Card className={styles.modal}>
        <h3 className={styles.modalTitle}>New resource</h3>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="r-type">Type</label>
            <select id="r-type" value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="article">Article</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className={styles.formField}>
            <label htmlFor="r-cat">Category</label>
            <select id="r-cat" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={`${styles.formField} ${styles.fullCol}`}>
            <label htmlFor="r-title">Title *</label>
            <input id="r-title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Resource title" />
          </div>
          <div className={`${styles.formField} ${styles.fullCol}`}>
            <label htmlFor="r-excerpt">Excerpt *</label>
            <textarea id="r-excerpt" value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="1–2 sentence summary" rows={2} />
          </div>
          {form.type === 'article' ? (
            <div className={`${styles.formField} ${styles.fullCol}`}>
              <label htmlFor="r-content">Content</label>
              <textarea id="r-content" value={form.content} onChange={e => set('content', e.target.value)} placeholder="Write the full article…" rows={8} />
            </div>
          ) : (
            <div className={`${styles.formField} ${styles.fullCol}`}>
              <label htmlFor="r-video">YouTube embed URL</label>
              <input id="r-video" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/embed/…" />
            </div>
          )}
        </div>
        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save resource</Button>
        </div>
      </Card>
    </div>
  );
}

export default function AdminResourcesPage() {
  const dispatch  = useDispatch();
  const resources = useSelector(selectAllResources);
  const [showForm, setShowForm]     = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = typeFilter === 'all' ? resources : resources.filter(r => r.type === typeFilter);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Resources</h1>
            <p>{resources.filter(r => r.isPublished).length} published · {resources.filter(r => !r.isPublished).length} drafts</p>
          </div>
          <Button onClick={() => setShowForm(true)}>+ Add resource</Button>
        </div>

        <div className={styles.filterRow}>
          {['all', 'article', 'video'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={typeFilter === t ? styles.filterBtnActive : styles.filterBtn}
            >
              {t === 'all' ? 'All' : t + 's'}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {filtered.map(r => (
            <Card key={r.id}>
              <div className={styles.resourceRow}>
                <div className={styles.resourceIcon}>
                  {r.type === 'video' ? <VideoIcon /> : <ArticleIcon />}
                </div>
                <div className={styles.resourceInfo}>
                  <p className={styles.resourceTitle}>{r.title}</p>
                  <p className={styles.resourceMeta}>{r.category} · {r.publishedAt} · {r.readTime || r.duration || '–'}</p>
                </div>
                <div className={styles.resourceActions}>
                  <span className={`${styles.badge} ${r.isPublished ? styles.published : styles.draft}`}>
                    {r.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => dispatch(togglePublished(r.id))}>
                    {r.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => dispatch(deleteResource(r.id))}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <p className={styles.empty}>No resources yet.</p>}
        </div>
      </div>

      {showForm && (
        <ResourceForm onSave={data => dispatch(addResource(data))} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
