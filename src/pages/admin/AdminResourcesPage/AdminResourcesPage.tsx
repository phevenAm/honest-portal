import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAllResources,
  createResource,
  deleteResource,
  togglePublished,
  fetchResources,
  updateResource,
} from "../../../store/slices/resourcesSlice";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import styles from "./AdminResourcesPage.module.scss";
import type { AppDispatch, RootState } from "../../../store/index";
import { Resource } from "../../../models/globalTypes";
import { ArticleIcon, VideoIcon } from "../../../components/shared/Icons/Icons";
import { ResourceForm } from "./AdminResourcesPageForm";
import { useFetchOnIdle } from "../../../Hooks/Hooks";

const CATEGORIES = [
  "Psychoeducation",
  "Coping Skills",
  "Breathwork",
  "Self-Compassion",
  "Relationships",
  "General",
];


export default function AdminResourcesPage() {
  const resources: Resource[] = useSelector(selectAllResources);
  const [showForm, setShowForm] = useState(false);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const [typeFilter, setTypeFilter] = useState("all");

  const dispatch: AppDispatch = useDispatch();

  const filtered =
    typeFilter === "all"
      ? resources
      : resources.filter((r) => r.type === typeFilter);

  useFetchOnIdle(
    (state) => state.resources.status,
    fetchResources,
    "Failed to fetch resources:",
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Resources</h1>
            <p>
              {resources.filter((r) => r.is_published).length} published ·{" "}
              {resources.filter((r) => !r.is_published).length} drafts
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>+ Add resource</Button>
        </div>

        <div className={styles.filterRow}>
          {["all", "article", "video"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={
                typeFilter === t ? styles.filterBtnActive : styles.filterBtn
              }
            >
              {t === "all" ? "All" : t + "s"}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {filtered.map((r) => (
            <Card key={r.id}>
              <div className={styles.resourceRow}>
                <div className={styles.resourceIcon}>
                  {r.type === "video" ? <VideoIcon /> : <ArticleIcon />}
                </div>
                <div className={styles.resourceInfo}>
                  <p className={styles.resourceTitle}>{r.title}</p>
                  {/*<p className={styles.resourceMeta}>{r.category} · {r.updated_at} · {r.readTime || r.duration || '–'}</p>*/}
                  <p className={styles.resourceMeta}>
                    {" "}
                    · Lasted edited:{" "}
                    {new Date(r.updated_at).toLocaleDateString()} ·
                  </p>
                </div>
                <div className={styles.resourceActions}>
                  <span
                    className={`${styles.badge} ${r.is_published ? styles.published : styles.draft}`}
                  >
                    {r.is_published ? "Published" : "Draft"}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      dispatch(
                        togglePublished({
                          id: r.id,
                          is_published: !r.is_published,
                        }),
                      )
                    }
                  >
                    {r.is_published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingResource(r);
                      setShowEditForm(true);
                      console.log(
                        "editing resource, button clicked",
                        editingResource,
                      );
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => dispatch(deleteResource(r.id))}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className={styles.empty}>No resources yet.</p>
          )}
        </div>
      </div>

      {showForm && (
        <ResourceForm
          onSave={(data) => dispatch(createResource(data))}
          onClose={() => setShowForm(false)}
        />
      )}
      {showEditForm && editingResource && (
        <ResourceForm
          resource={editingResource}
          onSave={(data) =>
            dispatch(updateResource({ id: editingResource.id, ...data }))
          }
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}
