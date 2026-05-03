import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllResources, createResource, deleteResource, togglePublished,fetchResources, updateResource } from '../../../store/slices/resourcesSlice';
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import styles from './AdminResourcesPage.module.scss';
import type { AppDispatch, RootState } from '../../../store/index';
import { Resource } from '../../../models/globalTypes';
import { ArticleIcon, VideoIcon } from '../../../components/shared/Icons/Icons';
import { ResourceForm } from './AdminResourcesPageForm';

const CATEGORIES = ['Psychoeducation', 'Coping Skills', 'Breathwork', 'Self-Compassion', 'Relationships', 'General'];

//function ResourceForm({ onSave, onClose, resource }: { onSave: (data: any) => void; onClose: () => void, resource?: object | null }) {
//  const [form, setForm] = useState({ type: 'article', title: '', summary: '', content: '', videoUrl: '', category: 'General' });

//  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  
//  if(resource) {
//    useEffect(() => {
//      if(resource) setForm({ type: resource.type, title: resource.title, summary: resource.summary, content: resource.content || '', videoUrl: resource.videoUrl || '', category: resource.category });
//    }, [resource]);

//    console.log('editing resource', resource);
//  }

//  const handleSave = () => {
//    if (!form.title.trim() || !form.summary.trim()) { alert('Title and summary are required'); return; }
//    onSave(form);
//    onClose();
//  };

//  return (
//    <div className={styles.overlay}>
//      <Card className={styles.modal}>
//        <h3 className={styles.modalTitle}>{resource ? 'Edit resource' : 'New resource'}</h3>
//        <div className={styles.formGrid}>
//          <div className={styles.formField}>
//            <label htmlFor="r-type">Type</label>
//            <select id="r-type" value={form.type} onChange={e => set('type', e.target.value)}>
//              <option value="article">Article</option>
//              <option value="video">Video</option>
//            </select>
//          </div>
//          <div className={styles.formField}>
//            <label htmlFor="r-cat">Category</label>
//            <select id="r-cat" value={form.category} onChange={e => set('category', e.target.value)}>
//              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
//            </select>
//          </div>
//          <div className={`${styles.formField} ${styles.fullCol}`}>
//            <label htmlFor="r-title">Title *</label>
//            <input id="r-title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Resource title" />
//          </div>
//          <div className={`${styles.formField} ${styles.fullCol}`}>
//            <label htmlFor="r-summary">Summary *</label>
//            <textarea id="r-summary" value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="1–2 sentence summary" rows={2} />
//          </div>
//          {form.type === 'article' ? (
//            <div className={`${styles.formField} ${styles.fullCol}`}>
//              <label htmlFor="r-content">Content</label>
//              <textarea id="r-content" value={form.content} onChange={e => set('content', e.target.value)} placeholder="Write the full article…" rows={8} />
//            </div>
//          ) : (
//            <div className={`${styles.formField} ${styles.fullCol}`}>
//              <label htmlFor="r-video">YouTube embed URL</label>
//              <input id="r-video" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/embed/…" />
//            </div>
//          )}
//        </div>
//        <div className={styles.modalActions}>
//          <Button variant="ghost" onClick={onClose}>Cancel</Button>
//          <Button onClick={handleSave}>{resource ? 'Update resource' : 'Save resource'}</Button>
//        </div>
//      </Card>
//    </div>
//  );
//}

export default function AdminResourcesPage() {
  const resources: Resource[] = useSelector(selectAllResources);
  const [showForm, setShowForm]     = useState(false);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = typeFilter === 'all' ? resources : resources.filter(r => r.type === typeFilter);

    const dispatch = useDispatch<AppDispatch>();
  
    const resourcesStateStatus = useSelector(
      (state: RootState) => state.resources.status,
    );
  
    useEffect(() => {
      if (resourcesStateStatus === "idle") {
        dispatch(fetchResources())
          .unwrap()
          .catch((err) => {
            console.error("Failed to fetch resources:", err);
          });
      }
    }, [dispatch, resourcesStateStatus]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Resources</h1>
            <p>{resources.filter(r => r.is_published).length} published · {resources.filter(r => !r.is_published).length} drafts</p>
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
                  {/*<p className={styles.resourceMeta}>{r.category} · {r.updated_at} · {r.readTime || r.duration || '–'}</p>*/}
                  <p className={styles.resourceMeta}> · Lasted edited: {new Date(r.updated_at).toLocaleDateString()} ·</p>
                </div>
                <div className={styles.resourceActions}>
                  <span className={`${styles.badge} ${r.is_published ? styles.published : styles.draft}`}>
                    {r.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => dispatch(togglePublished({id: r.id, is_published: !r.is_published}))}>
                    {r.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => {
                    setEditingResource(r);
                    setShowEditForm(true);
                    console.log('editing resource, button clicked', editingResource);
                  }}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => dispatch(deleteResource(r.id))}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <p className={styles.empty}>No resources yet.</p>}
        </div>
      </div>

      {showForm && (
        <ResourceForm onSave={data => dispatch(createResource(data))} onClose={() => setShowForm(false)} />
      )}
      {showEditForm && editingResource && (
        <ResourceForm
          resource={editingResource}
          onSave={data => dispatch(updateResource({ id: editingResource.id, ...data }))}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}
