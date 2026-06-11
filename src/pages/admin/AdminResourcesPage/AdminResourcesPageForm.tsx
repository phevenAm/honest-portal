import React, { useEffect, useState } from "react";

import Button from "@components/shared/Button/Button";
import Card from "@components/shared/Card/Card";
import { ArticleIcon, VideoIcon } from "@components/shared/Icons/Icons";
import { Resource } from "@models/globalTypes";
import {
  createResource,
  deleteResource,
  fetchResources,
  selectAllResources,
  togglePublished,
  updateResource,
} from "@store/slices/resourcesSlice";

import styles from "./AdminResourcesPage.module.scss";

const CATEGORIES = ["Psychoeducation", "Coping Skills", "Breathwork", "Self-Compassion", "Relationships", "General"];

export function ResourceForm({
  onSave,
  onClose,
  resource,
}: {
  onSave: (data: any) => void;
  onClose: () => void;
  resource?: Resource | null;
}) {
  const [form, setForm] = useState({
    type: "article",
    title: "",
    summary: "",
    content: "",
    videoUrl: "",
    url: "",
    category: "General",
    is_sensitive: false,
  });

  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!resource) return;

    setForm({
      type: resource.type,
      title: resource.title,
      summary: resource.summary ?? "",
      content: resource.content || "",
      videoUrl: resource.videoUrl || "",
      url: resource.url || "",
      category: resource.category,
      is_sensitive: resource.is_sensitive ?? false,
    });
  }, [resource]);

  const handleSave = () => {
    if (!form.title.trim() || !form.summary.trim()) {
      alert("Title and summary are required");
      return;
    }

    if (form.type === "video" && !form.videoUrl.trim()) {
      alert("Video URL is required");
      return;
    }

    if ((form.type === "document" || form.type === "link") && !form.url.trim()) {
      alert("URL is required");
      return;
    }

    onSave(form);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <Card className={styles.modal}>
        <h3 className={styles.modalTitle}>{resource ? "Edit resource" : "New resource"}</h3>

        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="r-type">Type</label>
            <select id="r-type" value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="link">Website</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="r-cat">Category</label>
            <select id="r-cat" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.formField} ${styles.fullCol}`}>
            <label htmlFor="r-title">Title *</label>
            <input
              id="r-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Resource title"
            />
          </div>

          <div className={`${styles.formField} ${styles.fullCol}`}>
            <label htmlFor="r-summary">Summary *</label>
            <textarea
              id="r-summary"
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="1–2 sentence summary"
              rows={2}
            />
          </div>

          {form.type === "article" && (
            <div className={`${styles.formField} ${styles.fullCol}`}>
              <label htmlFor="r-content">Content</label>
              <textarea
                id="r-content"
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder="Write the full article…"
                rows={8}
              />
            </div>
          )}

          {form.type === "video" && (
            <div className={`${styles.formField} ${styles.fullCol}`}>
              <label htmlFor="r-video">YouTube embed URL *</label>
              <input
                id="r-video"
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          )}

          {(form.type === "document" || form.type === "link") && (
            <div className={`${styles.formField} ${styles.fullCol}`}>
              <label htmlFor="r-url">{form.type === "document" ? "Document URL *" : "Website URL *"}</label>
              <input
                id="r-url"
                value={form.url}
                onChange={(e) => set("url", e.target.value)}
                placeholder={form.type === "document" ? "https://docs.google.com/document/..." : "https://example.com"}
              />
            </div>
          )}
        </div>

        <label className={styles.sensitiveRow}>
          <input
            type="checkbox"
            checked={form.is_sensitive}
            onChange={(e) => setForm((current) => ({ ...current, is_sensitive: e.target.checked }))}
          />
          <span>
            <strong>Sensitive content</strong> — restrict to adult clients only
          </span>
        </label>

        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSave}>{resource ? "Update resource" : "Save resource"}</Button>
        </div>
      </Card>
    </div>
  );
}
