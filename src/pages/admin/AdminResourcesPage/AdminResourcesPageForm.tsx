import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllResources, createResource, deleteResource, togglePublished,fetchResources, updateResource } from '../../../store/slices/resourcesSlice';
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import styles from './AdminResourcesPage.module.scss';
import type { AppDispatch, RootState } from '../../../store/index';
import { Resource } from '../../../models/globalTypes';
import { ArticleIcon, VideoIcon } from '../../../components/shared/Icons/Icons';

const CATEGORIES = ['Psychoeducation', 'Coping Skills', 'Breathwork', 'Self-Compassion', 'Relationships', 'General'];

export function ResourceForm({ onSave, onClose, resource }: { onSave: (data: any) => void; onClose: () => void, resource?: Resource | null }) {
  const [form, setForm] = useState({ type: 'article', title: '', summary: '', content: '', videoUrl: '', category: 'General' });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  
  if(resource) {
	useEffect(() => {
	  if(resource) setForm({ type: resource.type, title: resource.title, summary: resource.summary, content: resource.content || '', videoUrl: resource.videoUrl || '', category: resource.category });
	}, [resource]);

	console.log('editing resource', resource);
  }

  const handleSave = () => {
	if (!form.title.trim() || !form.summary.trim()) { alert('Title and summary are required'); return; }
	onSave(form);
	onClose();
  };

  return (
	<div className={styles.overlay}>
	  <Card className={styles.modal}>
		<h3 className={styles.modalTitle}>{resource ? 'Edit resource' : 'New resource'}</h3>
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
			<label htmlFor="r-summary">Summary *</label>
			<textarea id="r-summary" value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="1–2 sentence summary" rows={2} />
		  </div>
		  {form.type === 'article' ? (
			<div className={`${styles.formField} ${styles.fullCol}`}>
			  <label htmlFor="r-content">Content</label>
			  <textarea id="r-content" value={form.content} onChange={e => set('content', e.target.value)} placeholder="Write the full article…" rows={8} />
			</div>
		  ) : (
			<div className={`${styles.formField} ${styles.fullCol}`}>
			  <label htmlFor="r-video">YouTube embed URL</label>
			  <input id="r-video" required={form.type === 'video'} value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/embed/…" />
			</div>
		  )}
		</div>
		<div className={styles.modalActions}>
		  <Button variant="ghost" onClick={onClose}>Cancel</Button>
		  <Button onClick={handleSave}>{resource ? 'Update resource' : 'Save resource'}</Button>
		</div>
	  </Card>
	</div>
  );
}
